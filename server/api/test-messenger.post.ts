import { deliverMessage, rawMessenger2Runtime, answer } from '~~/utils/utils'

export default defineEventHandler(answer(async event => {
  const { raw, message }: { raw: string; message: Pair } = await readBody(event)
  // messenger id is not required for test
  if(!raw) {
    throw new Error('Missing "raw"')
  }
  if(!message) {
    throw new Error('Missing "message"')
  }
  const messenger = await rawMessenger2Runtime(raw)
  const result = await deliverMessage(messenger, message)
  return result
}))
