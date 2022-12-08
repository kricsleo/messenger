import { messengerCache } from '~~/server/db'
import { createServerError, defineAnswer } from '../utils/utils'
import { omit } from 'lodash-es'

export default defineAnswer(async event => {
  const messengerId = getQuery(event).id as string
  const messenger = messengerCache.get(messengerId)
  if(!messenger) {
    throw createServerError('Messenger not exist')
  }
  return omit(messenger, 'runtime')
})
