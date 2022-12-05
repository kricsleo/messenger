import { messengerCache } from '~~/server/db'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(async event => {
  const messengerId = getQuery(event).id as string
  const messenger = messengerCache.get(messengerId)
  if(!messenger) {
    throw new Error('messenger not exist')
  }
  const { runtime, ...rest } = messenger
  return rest
})
