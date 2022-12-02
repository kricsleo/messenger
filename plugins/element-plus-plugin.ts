import { ID_INJECTION_KEY } from "element-plus";

export default defineNuxtPlugin(nuxtApp => {
  // @see: https://github.com/element-plus/element-plus/issues/7963
  nuxtApp.vueApp.provide(ID_INJECTION_KEY, {
    prefix: 1024,
    current: 0,
  });
});
