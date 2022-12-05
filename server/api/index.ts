import { name, version } from '../../package.json'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(() => {
  return {
    name,
    version,
  }
})
