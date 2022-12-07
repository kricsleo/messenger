import { H3Event, isError, createError } from 'h3'
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

/**
 * TODO: PREFER HTTP STATUS CODE
 */
export function defineAnswer(fn: (event: H3Event) => any) {
  return defineEventHandler(async (event: H3Event) => {
    try {
      const result = await fn(event);
      debug.log('Server answerd', event.node.req.url);
      return success(result) as any;
    } catch(e:any) {
      debug.error('Server error', event.node.req.url, e);
      if(isError(e)) {
        sendError(event, e)
      } else {
        return fail(e?.message || 'unknown error')
      }
    }
  })
}

export function transpileString(str: string) {
  const result = ts.transpile(str, { 
    target: ts.ScriptTarget.ESNext
  })
  return result
}

/**
 * compile string to runtime
 * using "SourceTextModule"(https://nodejs.org/api/vm.html#class-vmmodule) as first choice,
 * if "--experimental-vm-modules" is not enabled,
 * fallback to "unsafe" "import('data:')"
 */
export async function string2Runtime(str: string) {
  // @ts-expect-error experimental
  if(vm.SourceTextModule) {
    // running context
    const context = vm.createContext({});
    // @ts-expect-error experimental
    const vmModule = new vm.SourceTextModule(str, { context })
    await vmModule.link((specifier: string) => {
      // for security:
      // "import" is forbidden
      // "require" is also undefined
      throw new Error(`"import" is forbidden: you are importing "${specifier}"`)
    });
    await vmModule.evaluate()
    return vmModule.namespace
  } else {
    debug.warn(`"--experimental-vm-modules" is not enabled, fallback to "import" to compile module`)
    const module = await import(`data:text/javascript;base64,${Buffer.from(str).toString('base64')}`)
    return module
  }
}

export async function rawMessenger2Runtime(raw: string) {
  const transpiledCode = transpileString(raw)
  const runtime: { default: Messenger['runtime']; meta: Messenger['meta'] } = await string2Runtime(transpiledCode)
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
  if(typeof target === 'string') {
    reply = await $fetch(target, { 
      method: 'POST', 
      body: delivered
    }).catch(e => {
      throw createError({
        // Bad Gateway
        statusCode: 502,
        statusMessage: `Undelivered: ${e.message}`,
      })
    })
  } else {
    let failed = 0
    reply = await Promise.all(target.map(href => $fetch(href, { 
      method: 'POST', 
      body: delivered
    }).catch(e => {
      failed++
      return `${href} replyed error: ${e.message}`
    })))
    if(failed === target.length) {
      throw createError({
        // Bad Gateway
        statusCode: 502,
        statusMessage: 'Undelivered',
      })
    }
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

export function isValidHref(href: string) {
  const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return urlPattern.test(href)
}

export const myNanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 4)

export class RateControl {
  rate: number
  period: number
  stack: Map<string, number>
  cleanTimer: NodeJS.Timer | undefined
  constructor(rate: number, period: number) {
    this.rate = rate
    this.period = period
    this.stack = new Map<string, number>()
  }
  push(id: string) {
    const currentRate = this.stack.get(id)
    if(currentRate && currentRate > this.rate) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Limited',
      })
    }
    this.stack.set(id, (currentRate || 0) + 1)
    if(!this.cleanTimer) {
      this.autoClean()
    }
  }
  autoClean() {
    this.cleanTimer = setTimeout(() => {
      this.stack = new Map<string, number>()
      this.cleanTimer = undefined
    }, this.period)
  }
}
