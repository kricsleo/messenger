import { loadExistedMessenger } from '../db/messengerDB'

export default defineNitroPlugin(async app => {
  await loadExistedMessenger()
});


