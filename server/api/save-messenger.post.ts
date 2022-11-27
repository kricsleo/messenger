import { answer, transpileExchanger } from '~~/utils/utils'
import { saveMessenger } from '~~/composables/db'

/** Save Messenger */
export default defineEventHandler(answer(async event => {
  const messenger: Messenger = await readBody(event)
  if(!messenger || !messenger.id || !messenger.exchanger || !messenger.address) {
    throw new Error('Missing required info for a messenger')
  }
  try {
    messenger.transpiledExchanger = transpileExchanger(messenger.exchanger)
    await saveMessenger(messenger)
    return 'Messenger saved'
  } catch(e: any) {
    throw new Error(`Invalid Messenger: ${e.message}`)
  }
}))
