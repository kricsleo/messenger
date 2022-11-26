interface Transformer {
  code: string
}

export default defineEventHandler(async event => {
  const body: Transformer = await readBody(event)
  return {body}
})
