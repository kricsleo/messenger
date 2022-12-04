import { messengerCache } from '~~/server/db'
import { answer } from '~~/utils/utils'

export default defineEventHandler(answer(async event => {
  const messengerId = getQuery(event).id as string
  const messenger = messengerCache.getMessenger(messengerId)
  if(!messenger) {
    throw new Error('messenger not exist')
  }
  const { runtime, ...rest } = messenger
  return rest
}))
