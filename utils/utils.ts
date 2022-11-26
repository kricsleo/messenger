import { transpile } from 'typescript'
import fs from 'fs/promises'

/** Successful response */
export function success<T = any>(data: T): Result<T> {
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
