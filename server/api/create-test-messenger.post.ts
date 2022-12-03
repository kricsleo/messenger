import { answer, rawMessenger2Runtime } from '~~/utils/utils'
import { messengerCache } from '~~/composables/db'

/** create a online messenger temporarily for test */
export default defineEventHandler(answer(async event => {
  const { raw }: { raw: string } = await readBody(event)
  if(!raw) {
    throw new Error('"raw" is required')
  }
  const id = createMessengerId()
  const result = await rawMessenger2Runtime(raw)
  messengerCache.setMessenger(id, { id, raw, ...result })
  return { id }
}))
