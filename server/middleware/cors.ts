export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": '*',
    "Access-Control-Expose-Headers": '*'
  })
  if(getMethod(event) === 'OPTIONS'){
    event.node.res.statusCode = 204
    event.node.res.statusMessage = "No Content."
    return 'OK'
  }
})
