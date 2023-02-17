import { createMessengerId, messengerCache } from '~~/server/db/messengerDB'
import { createServerError, defineAnswer, rawMessenger2Runtime } from '../utils/utils';

/** save an online messenger temporarily for test */
export default defineAnswer(async event => {
  const body: { raw: string; id?: string } = await readBody(event)
  if(!body.raw) {
    throw createServerError('"raw" is required', 400)
  }
  const id = body.id || createMessengerId()
  const messenger = messengerCache.get(id)
  // only temporarily messenger can be edit
  if(messenger && !messenger.temp) {
    throw createServerError(`This messenger can't be overwritten`, 403)
  }
  const result = await rawMessenger2Runtime(body.raw)
  messengerCache.set(id, { id, raw: body.raw, temp: true, ...result })
  return { id }
})
