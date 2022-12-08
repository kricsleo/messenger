import { createServerError, defineAnswer, deliverMessage, rawMessenger2Runtime, validateTarget } from '../utils/utils';

export default defineAnswer(async event => {
  const body: { raw: string; message: Pair; target: Target } = await readBody(event)
  // messenger id is not required for test
  if(!body.raw) {
    throw createServerError('Missing "raw"')
  }
  if(!body.message) {
    throw createServerError('Missing "message"')
  }
  const targetInvalidMsg = validateTarget(body.target)
  if(targetInvalidMsg) {
    throw createServerError(targetInvalidMsg)
  }
  const messenger = await rawMessenger2Runtime(body.raw)
  const result = await deliverMessage(messenger.runtime, body.target, body.message)
  return result
})
