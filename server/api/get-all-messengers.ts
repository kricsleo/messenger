import { getAllMessengers } from '~~/composables/db'

export default defineEventHandler(answer(async event => {
  const messengers = await getAllMessengers()
  return {
    messengers
  }
}))
