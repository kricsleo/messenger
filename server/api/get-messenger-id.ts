import { createMessengerId } from '~~/server/db'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(async event => {
  const messengerId = createMessengerId()
  return {
    id: messengerId
  }
})
