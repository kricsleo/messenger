interface Messenger {
  id: string
  code: string
  target: string
}

interface RuntimeMessenger extends Messenger {
  run: (...args: any) => any
}

interface Result<T = any> {
  c: number
  m?: string
  d?: T
}
