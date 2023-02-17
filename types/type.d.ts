type Runtime = (...args: any) => any
type Target = string | string[]

interface Messenger {
  id: string
  raw: string
  transpiled: string
  runtime: Runtime
  meta?: {
    author?: string
    description?: string
  }
  active?: boolean
  temp?: boolean
}
interface CachedMessage {
  id: string
  messengerId: string
  message: string
  target: Target
  size: number
  timestamp: number
}
type Pair<T = any> = Record<string, T>
/** list request params */
interface ListReq<T> {
  page: number
  size: number
  [k in T]: T[k]
}
/** list response */
interface List<T> {
  list: T[]
  total: number
}

