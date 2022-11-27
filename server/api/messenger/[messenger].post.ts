import { getRuntime } from '~~/composables/db'
import { answer } from '~~/utils/utils'

/** Call Messenger to deliver message */
export default defineEventHandler(answer(async event => {
  const body = await readBody(event)
  const messengerId = event.context.params.messenger as string
  const runtime = await getRuntime(messengerId)
  if(!runtime) {
    throw new Error('Messenger not found')
  }
  const letter = runtime.run(body)
  const res = await $fetch(runtime.target, { method: 'POST', body: letter })
  return {
    msg: 'Messenger delivered',
    res,
    letter
  }
}))
