export function useOrigin() {
  const origin = ref('')
  onMounted(() => {
    origin.value = window.location.origin
  })
  return origin
}
