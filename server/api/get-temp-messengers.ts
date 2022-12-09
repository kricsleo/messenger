import { messengerCache } from '~~/server/db'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(async event => {
  const messengers = messengerCache
    .getAll()
    .filter(messenger => messenger.temp)
  return { messengers }
})
