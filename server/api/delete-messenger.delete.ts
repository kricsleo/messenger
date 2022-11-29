import { removeMessenger } from '~~/composables/db'
import { answer } from '~~/utils/utils'

export default defineEventHandler(answer(async event => {
  const body = await readBody(event)
  const messengerId = body.id as string
  await removeMessenger(messengerId)
  return 'Messenger deleted.'
}))
