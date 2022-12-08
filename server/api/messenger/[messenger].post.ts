import { getActiveMessenger } from '~~/server/db'
import { createServerError, defineAnswer, deliverMessage, RateControl, validateTarget } from '~~/server/utils/utils'

/** 
 * In case of "network storm" caused by a loop: A -> B -> C -> A -> B ...,
 * limit to 30 calls for every 60 seconds with the same messenger
 */
 export const messengerRateControl = new RateControl(3, 60 * 1000)

/** Call Messenger to deliver message */
export default defineAnswer(async event => {
  const body = await readBody(event)
  const query = getQuery(event)
  const targetInvalidMsg = validateTarget(query.target)
  if(targetInvalidMsg) {
    throw createServerError(targetInvalidMsg)
  }
  const messengerId = event.context.params.messenger as string
  const messenger = await getActiveMessenger(messengerId)
  if(!messenger) {
    throw createServerError('Messenger not found', 404)
  }
  messengerRateControl.push(messenger.id)
  const result  = await deliverMessage(messenger.runtime, query.target as Target, body)
  return result
})
