import { messengerCache } from '~~/server/db'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(async event => {
  const body = await readBody(event)
  const messengerId = body.id as string
  // persisted messenger can also be deleted
  // in some edge case
  messengerCache.removeMessenger(messengerId)
  return 'Messenger deleted.'
})
