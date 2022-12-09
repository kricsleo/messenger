type Runtime = (...args: any) => any
type Target = string | string[]

interface Messenger {
  id: string
  raw: string
  transpiled: string
  runtime: Runtime
  meta?: {
    description?: string
  }
  active?: boolean
  temp?: boolean
}

interface Template {
  id: string
  raw: string
}

type Pair<T = any> = Record<string, T>
