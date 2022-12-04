import { loadExistedMessenger } from '~~/composables/db'

export default defineNuxtPlugin(async app => {
  console.log('runing init messengers');
    const messengers = await loadExistedMessenger()
    messengers.forEach(messenger => {
      messengerCache.setMessenger(messenger.id, messenger)
    });
    console.log('runed init messengers');
});


