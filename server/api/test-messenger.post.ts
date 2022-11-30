import { exchangeMessage, messenger2Runtime, answer } from '~~/utils/utils'

export default defineEventHandler(answer(async event => {
  const messenger: MessengerWithmessage = await readBody(event)
  // messenger id is not required for test
  if(!messenger || !messenger.exchanger || !messenger.address) {
    throw new Error('Missing required info for a messenger')
  }
  // a runtime cache can be used here for the test
  const { runtime } = await messenger2Runtime(messenger)
  const runtimeMessenger = { ...messenger, runtime }
  const result = await exchangeMessage(runtimeMessenger, messenger.message)
  return result
}))
