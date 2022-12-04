import { createMessengerId } from '~~/server/db'
import { answer } from '~~/utils/utils'

export default defineEventHandler(answer(async event => {
  const messengerId = createMessengerId()
  return {
    id: messengerId
  }
}))
