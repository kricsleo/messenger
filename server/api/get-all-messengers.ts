import { getAllMessengers } from '~~/composables/db'
import { answer } from '~~/utils/utils'

export default defineEventHandler(answer(async event => {
  const messengers = await getAllMessengers()
  return {
    messengers
  }
}))
