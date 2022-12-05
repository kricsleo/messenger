interface Messenger {
  id: string
  raw: string
  transpiled: string
  runtime: (...args: any) => any
  meta: {
    description?: string
    target: string | string[]
  }
  active?: boolean
  temp?: boolean
}

interface Template {
  id: string
  name: string
  exchanger: string
}

interface Result<T = any> {
  c: number
  m?: string
  d?: T
}

type Pair<T = any> = Record<string, T>
