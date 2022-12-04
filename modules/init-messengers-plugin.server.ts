export default defineNuxtPlugin(async app => {
  console.log('runing init messengers');
  await loadExistedMessenger()
  console.log('runed init messengers');
});


