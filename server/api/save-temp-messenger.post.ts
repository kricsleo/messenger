import { answer, rawMessenger2Runtime } from '~~/utils/utils'
import { createMessengerId, messengerCache } from '~~/server/db'

/** save an online messenger temporarily for test */
export default defineEventHandler(answer(async event => {
  const body: { raw: string; id?: string } = await readBody(event)
  if(!body.raw) {
    throw new Error('"raw" is required')
  }
  const id = body.id || createMessengerId()
  const messenger = messengerCache.getMessenger(id)
  // only temporarily messenger can be edit
  if(messenger && !messenger.temp) {
    throw new Error(`this messenger can't be overwritten`)
  }
  const result = await rawMessenger2Runtime(body.raw)
  messengerCache.setMessenger(id, { id, raw: body.raw, temp: true, ...result })
  return { id }
}))
