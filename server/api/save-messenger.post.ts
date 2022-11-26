interface Messenger {
  code: string
}

/** Save Messenger */
export default defineEventHandler(async event => {
  const body: Messenger = await readBody(event)
  return {body}
})
