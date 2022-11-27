import { answer } from '~~/utils/utils'

export default defineEventHandler(answer(async event => {
  const messengerId = getQuery(event).id as string
  const messenger = await getMessenger(messengerId)
  return messenger
}))
