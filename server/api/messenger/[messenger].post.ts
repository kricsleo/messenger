import { getActiveMessenger } from '~~/server/db'
import { defineAnswer } from '~~/server/utils/utils'

/** Call Messenger to deliver message */
export default defineAnswer(async event => {
  const body = await readBody(event)
  const messengerId = event.context.params.messenger as string
  const messenger = await getActiveMessenger(messengerId)
  if(!messenger) {
    throw new Error('Messenger not found')
  }
  const result  = await deliverMessage(messenger, body)
  return result
})
