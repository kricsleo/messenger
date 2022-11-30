import { answer, messenger2Runtime } from '~~/utils/utils'
import { saveMessenger } from '~~/composables/db'

/** Save Messenger */
export default defineEventHandler(answer(async event => {
  const messenger: Messenger = await readBody(event)
  if(!messenger || !messenger.id || !messenger.exchanger || !messenger.address) {
    throw new Error('Missing required info for a messenger')
  }
  try {
    const { transpiled } = await messenger2Runtime(messenger)
    messenger.transpiledExchanger = transpiled
    // save to persistent storage
    await saveMessenger(messenger)
    // not save to memory storage to reduce memory usage,
    // only do it when runtime messenger is called
    // setRuntimeMessenger({ ...messenger, runtime })
    return 'Messenger saved'
  } catch(e: any) {
    throw new Error(`Invalid Messenger: ${e.message}`)
  }
}))
