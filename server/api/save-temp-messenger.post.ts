import { createMessengerId, messengerCache } from '~~/server/db'
import { defineAnswer, rawMessenger2Runtime } from '../utils/utils';

/** save an online messenger temporarily for test */
export default defineAnswer(async event => {
  const body: { raw: string; id?: string } = await readBody(event)
  if(!body.raw) {
    throw new Error('"raw" is required')
  }
  const id = body.id || createMessengerId()
  const messenger = messengerCache.get(id)
  // only temporarily messenger can be edit
  if(messenger && !messenger.temp) {
    throw new Error(`this messenger can't be overwritten`)
  }
  const result = await rawMessenger2Runtime(body.raw)
  messengerCache.set(id, { id, raw: body.raw, temp: true, ...result })
  return { id }
})
