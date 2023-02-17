import { createMessengerId } from '~~/server/db/messengerDB'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(async event => {
  const messengerId = createMessengerId()
  return {
    id: messengerId
  }
})
