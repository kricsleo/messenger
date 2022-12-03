import { messengerCache } from '~~/composables/db'
import { answer } from '~~/utils/utils'

export default defineEventHandler(answer(async event => {
  const messengers = messengerCache.getAllMessengers()
  return {
    messengers
  }
}))
