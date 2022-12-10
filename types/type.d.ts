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

type Pair<T = any> = Record<string, T>
