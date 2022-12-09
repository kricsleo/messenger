import { MaybeRef, useBrowserLocation } from '@vueuse/core'

export function useOrigin() {
  const origin = ref('')
  onMounted(() => {
    origin.value = window.location.origin
  })
  return origin
}

export function useMessengerHref(messengerId: MaybeRef<string>) {
  const location = useBrowserLocation()
  return computed(() => unref(messengerId) 
    ? `${location.value.origin}/api/messenger/${unref(messengerId)}`
    : ''
  )
}
