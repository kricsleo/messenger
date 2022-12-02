import { ElMessage } from 'element-plus'
import { H3Event } from 'h3'
import ts from 'typescript'
import vm from 'vm'
import { customAlphabet } from 'nanoid'

/** Successful response */
export function success<T = any>(data?: T): Result<T> {
  return {
    c: 0,
    d: data
  }
}

/** Failed response */
export function fail(msg: string): Result<undefined> {
  return {
    c: -1,
    m: msg
  }
}

export function transpileCode(code: string) {
  const result = ts.transpile(code, { 
    target: ts.ScriptTarget.ESNext
  })
  return result
}

export async function code2Runtime(code: string) {
  // running context
  const context = vm.createContext({});
  // @ts-expect-error experimental
  const vmModule = new vm.SourceTextModule(code, { context })
  await vmModule.link((specifier: string) => {
    // for security:
    // "import" is forbidden
    // "require" is also undefined
    throw new Error(`"import" is forbidden: you are importing "${specifier}"`)
  });
  await vmModule.evaluate()
  return vmModule.namespace
}

export async function messenger2Runtime(messenger: Messenger) {
  const transpiledCode = messenger.transpiledExchanger || transpileCode(messenger.exchanger)
  const runtime = await code2Runtime(transpiledCode)
  // only use default export
  if(!runtime.default || typeof runtime.default !== 'function') {
    throw new Error('You must export a "default" function')
  }
  return {
    transpiled: transpiledCode,
    runtime: runtime.default.bind(null) as (this: null, v: any) => any
  }
}

export async function exchangeMessage(runtimeMessenger: RuntimeMessenger, message: Record<string, any>) {
  const delivered = runtimeMessenger.runtime(message)
  const reply = await $fetch(runtimeMessenger.address, { 
    method: 'POST', 
    body: delivered
  })
  return {
    message,
    delivered,
    reply
  }
}

export const debug = {
  error: (...args: any) => console.error(`[${new Date().toLocaleString()}]:`, ...args),
  warn: (...args: any) => console.warn(`[${new Date().toLocaleString()}]:`, ...args),
  log: (...args: any) => console.log(`[${new Date().toLocaleString()}]:`, ...args),
}

export function answer(fn: (event: H3Event) => any) {
  return async (event: H3Event) => {
    setResponseHeaders(event, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'PUT,POST,GET,DELETE,OPTIONS',
      'access-control-allow-headers': 'Origin, Content-Type, Accept'
    })
    try {
      const result = await fn(event);
      debug.log('Server answerd', event.node.req.url);
      return success(result) as any;
    } catch(e:any) {
      debug.error('Server error', event.node.req.url, e);
      return fail(e?.message || 'unknown error')
    }
  }
}

export const myFetch = $fetch.create({
  onRequestError({ error }) {
    ElMessage.error(error.message) 
  },
  async onResponse({ response }) {
    const data = response._data
    if(data?.c !== 0) {
      ElMessage.error(data?.m || 'Unknown error')  
      return Promise.reject(response)
    }
    response._data = data.d
  },
  onResponseError({ error }) {
    ElMessage.error(error?.message || 'Unknown error')
  },
})

export function isValidHref(href: string) {
  const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return urlPattern.test(href)
}

export const myNanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)
