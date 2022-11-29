interface Messenger {
  id: string
  exchanger: string
  transpiledExchanger: string
  address: string
}

interface RuntimeMessenger extends Messenger {
  runtime: (...args: any) => any
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
