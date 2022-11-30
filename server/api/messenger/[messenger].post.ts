import { getRuntimeMessenger } from '~~/composables/db'
import { answer, exchangeMessage } from '~~/utils/utils'

/** Call Messenger to deliver message */
export default defineEventHandler(answer(async event => {
  const body = await readBody(event)
  const messengerId = event.context.params.messenger as string
  const runtimeMessenger = await getRuntimeMessenger(messengerId)
  if(!runtimeMessenger) {
    throw new Error('Messenger not found')
  }
  const result  = await exchangeMessage(runtimeMessenger, body)
  return result
}))
