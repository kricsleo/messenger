import { templateCache } from '~~/server/db'
import { defineAnswer } from '../utils/utils'

export default defineAnswer(async event => {
  const templates = templateCache.getAll()
  return { templates }
})
