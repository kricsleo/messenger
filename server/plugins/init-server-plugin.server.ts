import { loadExistedMessenger, loadExistedTemplates } from '../db'

export default defineNitroPlugin(async app => {
  await Promise.all([
    loadExistedMessenger(),
    loadExistedTemplates()
  ])
});


