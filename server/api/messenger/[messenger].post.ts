import { getActiveMessenger } from '~~/server/db'
import { defineAnswer, deliverMessage, RateControl } from '~~/server/utils/utils'

/** 
 * In case of "network storm" caused by a loop: A -> B -> C -> A -> B ...,
 * limit to 30 calls for every 60 seconds with the same messenger
 */
 export const messengerRateControl = new RateControl(3, 60 * 1000)

/** Call Messenger to deliver message */
export default defineAnswer(async event => {
  const body = await readBody(event)
  const messengerId = event.context.params.messenger as string
  const messenger = await getActiveMessenger(messengerId)
  if(!messenger) {
    throw new Error('Messenger not found')
  }
  messengerRateControl.push(messenger.id)
  const result  = await deliverMessage(messenger, body)
  return result
})
