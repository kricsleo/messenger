import { ElMessage } from 'element-plus'
import { H3Event } from 'h3'
import ts from 'typescript'
import vm from 'vm'
import { customAlphabet } from 'nanoid'
import fs from 'fs/promises'

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

export async function code2RuntimeUnsafe(code: string) {
  const module = await import(`data:text/javascript,${code}`)
  return module
}

export async function rawMessenger2Runtime(raw: string) {
  const transpiledCode = transpileCode(raw)
  const runtime: { default: Messenger['runtime']; meta: Messenger['meta'] } = await code2RuntimeUnsafe(transpiledCode)
  // only use default export
  if(!runtime.default || typeof runtime.default !== 'function') {
    throw new Error('You must export a "default" function')
  }
  // validte meta info
  if(!runtime.meta || typeof runtime.meta !== 'object') {
    throw new Error('You must export a "meta" object describing messenger info')
  }
  const { target, description } = runtime.meta
  const isValidTarget = 
    typeof target === 'string' ? isValidHref(target)
    : Array.isArray(target) ? target.every(href => isValidHref(href))
      : false
  if(!isValidTarget) {
    throw new Error('"target" must a valid href or an array of it')
  }
  if(description && typeof description !== 'string') {
    throw new Error('"description" must a string')
  }
  return {
    transpiled: transpiledCode,
    meta: runtime.meta as Messenger['meta'],
    runtime: runtime.default.bind(null) as (this: null, v: any) => any
  }
}

export async function deliverMessage(messenger: Pick<Messenger, 'meta' | 'runtime'>, message: Pair) {
  const delivered = messenger.runtime(message)
  const {target} = messenger.meta
  let reply
  // todo: detect target loop
  if(typeof target === 'string') {
    reply = await $fetch(target, { 
      method: 'POST', 
      body: delivered
    })
  } else {
    reply = await Promise.all(target.map(href => $fetch(href, { 
      method: 'POST', 
      body: delivered
    }).catch(e => `${href} replyed error: ${e.message}`)))
  }
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

export function isValidHref(href: string) {
  const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return urlPattern.test(href)
}

export const myNanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 4)

/**
 * 封装异步状态
 * (@vue/core 提供的 useAsyncState 存在异步竞态的问题)
 */
 interface UseAsyncOptions {
  /** @default true */
  shallow?: boolean;
  /** @default true */
  reset?: boolean;
  /** @default true */
  immediate?: boolean;
}
interface UseAsyncReturn<Data, MaybeUndef = false> {
  data: MaybeUndef extends false ? Data : Data | undefined
  ready: boolean
  loading: boolean
  error: undefined | Error
  execute: (...args: any) => Promise<Data>
}
export function useAsync<Data>(
  fn: (...args: any) => Promise<Data> | Data
): UseAsyncReturn<Data, true>
export function useAsync<Data>(
  fn: (...args: any) => Promise<Data> | Data,
  initialData: Data,
  options?: UseAsyncOptions
): UseAsyncReturn<Data>
export function useAsync<Data>(
  fn: (...args: any) => Promise<Data> | Data,
  initialData?: Data,
  options?: UseAsyncOptions,
) {
  const { shallow = true, reset = true, immediate = true } = options || {};
  const data = shallow ? shallowRef(initialData) : ref(initialData);
  const state = reactive({
    data,
    ready: false,
    loading: false,
    error: undefined as unknown | undefined,
    execute,
  })
  let __racingId
  immediate && execute()
  return state

  async function execute(...args: any) {
    reset && (data.value = initialData);
    state.error = undefined
    state.ready = false
    state.loading = true
    __racingId = myNanoid();
    const executeRacingId = __racingId;
    try {
      const result = await fn(...args);
      // prevent async reacing
      if (executeRacingId !== __racingId) {
        return data.value;
      }
      data.value = result;
      state.ready = true;
    } catch (e) {
      // prevent async reacing
      if (executeRacingId !== __racingId) {
        return data.value;
      }
      state.error = e;
    }
    state.loading = false;
    return data.value;
  }
}
