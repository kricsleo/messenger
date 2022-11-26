/** Save Messenger */
export default defineEventHandler(async event => {
  const messenger: Messenger = await readBody(event)
  if(!messenger || !messenger.id || !messenger.code || !messenger.target) {
    return fail('Invalid messenger')
  }
  return {body}
})
