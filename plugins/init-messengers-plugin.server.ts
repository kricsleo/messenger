import { loadExistedMessenger } from '~~/composables/db'

export default defineNuxtPlugin(async app => {
  console.log(app, 90)
  const messengers = await loadExistedMessenger()
  messengers.forEach(messenger => {
    messengerCache.setMessenger(messenger.id, messenger)
  });
});


