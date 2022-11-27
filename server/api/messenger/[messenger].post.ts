import { getRuntimeMessenger } from '~~/composables/db'
import { answer } from '~~/utils/utils'

/** Call Messenger to deliver message */
export default defineEventHandler(answer(async event => {
  const body = await readBody(event)
  const messengerId = event.context.params.messenger as string
  const runtimeMessenger = await getRuntimeMessenger(messengerId)
  if(!runtimeMessenger) {
    throw new Error('Messenger not found')
  }
  const delivered = runtimeMessenger.runtime(body)
  const reply = await $fetch(runtimeMessenger.address, { method: 'POST', body: delivered })
  return {
    message: body,
    delivered,
    reply
  }
}))
