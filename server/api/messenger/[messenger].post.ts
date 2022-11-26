
/** Call Messenger to deliver message */
export default defineEventHandler(async event => {
  const body = await readBody(event)
  const params = await getQuery(event)
  const { messenger } = event.context.params
  return {
    params,
    messenger,
    body
  }
})
