import { getActiveMessenger } from '~~/composables/db'
import { answer, deliverMessage } from '~~/utils/utils'

/** Call Messenger to deliver message */
export default defineEventHandler(answer(async event => {
  const body = await readBody(event)
  const messengerId = event.context.params.messenger as string
  const messenger = await getActiveMessenger(messengerId)
  if(!messenger) {
    throw new Error('Messenger not found')
  }
  const result  = await deliverMessage(messenger, body)
  return result
}))
