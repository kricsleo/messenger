import { messengerCache } from '~~/server/db/messengerDB'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(async event => {
  const body = await readBody(event)
  const messengerId = body.id as string
  // persisted messenger can also be deleted
  // in some edge case we want to disable werid messenger
  messengerCache.remove(messengerId)
  return 'Messenger deleted.'
})
