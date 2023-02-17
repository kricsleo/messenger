import { H3Event, isError, createError } from 'h3'
import ts from 'typescript'
import vm from 'vm'
import { customAlphabet } from 'nanoid'
import { format as formatTime } from 'date-fns'

export function defineAnswer<T>(fn: (event: H3Event) => T) {
  return defineEventHandler(async (event: H3Event) => {
    try {
      const result = await fn(event);
      debug.log('Server answerd', event.node.req.url);
      return result;
    } catch(e:any) {
      debug.error('Server error', event.node.req.url, e);
      const serverError = isError(e) ? e : createServerError(e.message, 500)
      sendError(event, serverError)
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
      throw createServerError(`"import" is forbidden: you are importing "${specifier}"`)
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
  const runtime: { default: Runtime; meta: Messenger['meta'] } = await string2Runtime(transpiledCode)
  // only use default export
  if(!runtime.default || typeof runtime.default !== 'function') {
    throw createServerError('A "default" function should be exported')
  }
  return {
    transpiled: transpiledCode,
    meta: runtime.meta as Messenger['meta'],
    runtime: runtime.default.bind(null) as Runtime
  }
}

export function validateTarget(target?: string | string[] | null) {
  if(!target) {
    return 'Missing "target"'
  }
  const isValidTarget = 
    typeof target === 'string' ? isValidHref(target)
    : Array.isArray(target) ? target.every(href => isValidHref(href))
      : false
  if(!isValidTarget) {
    return '"target" must a valid href starts with "http(s)://" or an array of it'
  }
}

export async function deliverMessage(runtime: Runtime, target: string | string[], message: Pair) {
  const delivered = runtime(message)
  if(!delivered) {
    return {
      message,
      delivered,
      reply: null,
      sent: false
    }
  }
  let reply
  if(typeof target === 'string') {
    reply = await $fetch(target, { 
      method: 'POST', 
      body: delivered
    }).catch(e => {
      throw createServerError(`Undelivered: ${e.message}`, 500)
    })
  } else {
    let failed = 0
    reply = await Promise.all(target.map(href => $fetch(href, { 
      method: 'POST', 
      body: delivered
    }).catch(e => {
      failed++
      return e
    })))
    if(failed === target.length) {
      throw createServerError(`Undelivered: all failed, ${(reply[0] as Error).message}`, 500)
    }
  }
  return {
    message,
    delivered,
    reply,
    sent: true
  }
}

export const debug = {
  error: (...args: any) => console.error(`[${formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss')}]:`, ...args),
  warn: (...args: any) => console.warn(`[${formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss')}]:`, ...args),
  log: (...args: any) => console.log(`[${formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss')}]:`, ...args),
}

export function isValidHref(href: string) {
  const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return urlPattern.test(href)
}

export const uuid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)

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
      throw createServerError('Too many requests', 429)
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

export function createServerError(message: string, httpCode: number = 400) {
  return createError({
    statusCode: httpCode,
    statusMessage: message,
    message,
  })
}

/** cache with memory */
export class MemoryCache<T> {
  private cache: Map<string, T>
  constructor() {
    this.cache = new Map()
  }
  get(id: string) {
    return this.cache.get(id) ?? null
  }
  set(id: string, value: T) {
    return this.cache.set(id, value)
  }
  remove(id: string) {
    return this.cache.delete(id)
  }
  getAll() {
    return [...this.cache.values()]
  }
}

/** roughly calculate string size in memory */
export function roughMemorySizeOfString(str: string) {
  return str.length * 2;
}
