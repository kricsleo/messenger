<script setup lang="ts">
import { ElButton } from 'element-plus';

const props = defineProps<{
  onClick: () => Promise<any>
}>()
const attrs = useAttrs()

const loading = ref(false)

async function handleClick() {
  loading.value = true
  try {
    await props.onClick()
  } catch {/** nothing */}
  loading.value = false
}
</script>

<template>
  <ElButton v-bind="attrs" @click="handleClick">
    <slot />
  </ElButton>
</template>
