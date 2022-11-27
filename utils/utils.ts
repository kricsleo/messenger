import { transpile } from 'typescript'
import fs from 'fs/promises'
import { H3Event } from 'h3'
import ts from 'typescript'

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

/** Check if is valid js/ts code */
export function checkMessengerCode(code: string) {
  const result = transpile(code)
  return result
}

/** Check if file/path is exists */
export async function isFileExists(filepath: string) {
  return fs.access(filepath)
    .then(() => true)
    .catch(() => false)
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
      return success(result);
    } catch(e:any) {
      debug.error('Server error', event.node.req.url, e);
      return fail(e?.message || 'unknown error')
    }
  }
}

export function transpileExchanger(exchanger: string) {
  const transpiled = ts.transpileModule(exchanger, { 
    compilerOptions: { module: ts.ModuleKind.ESNext } }
  )
  return transpiled.outputText
}

export async function exchanger2Runtime(transpiledExchanger: string) {
  const base64Str = `data:text/javascript;base64,${Buffer.from(transpiledExchanger).toString('base64')}`
  const module = await import(base64Str)
  if(!module.default) {
    throw new Error('Missing default function')
  }
  return module.default
}
