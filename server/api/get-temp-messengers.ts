import { messengerCache } from '~~/server/db/messengerDB'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(async event => {
  const messengers = messengerCache
    .getAll()
    .filter(messenger => messenger.temp)
  return { messengers }
})
