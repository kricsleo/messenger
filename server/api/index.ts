import { answer } from '~~/utils/utils'
import { name, version } from '../../package.json'

export default defineEventHandler(answer(() => {
  return {
    name,
    version
  }
}))
