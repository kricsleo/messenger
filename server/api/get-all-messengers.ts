import { messengerCache } from '~~/server/db/messengerDB'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(async event => {
  const messengers = messengerCache.getAll()
  return { messengers }
})
