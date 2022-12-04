import { loadExistedMessenger } from '../db'

export default defineNitroPlugin(async app => {
  await loadExistedMessenger()
});


