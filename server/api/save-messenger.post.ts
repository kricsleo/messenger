import { answer } from '~~/utils/utils'
import { saveMessenger } from '~~/composables/db'

/** Save Messenger */
export default defineEventHandler(answer(async event => {
  const messenger: Messenger = await readBody(event)
  if(!messenger || !messenger.id || !messenger.code || !messenger.target) {
    throw new Error('Invalid messenger')
  }
  await saveMessenger(messenger)
  return 'Messenger saved'
}))
