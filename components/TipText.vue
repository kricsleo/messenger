<script setup lang="ts">
import { ElTooltip } from 'element-plus';

const props = defineProps<{
  text: string
}>()
const attrs = useAttrs()
const effect = computed(() => isDark.value ? 'dark' : 'light')
</script>

<template>
  <ElTooltip :content="text" :effect="effect" placement="top-start" v-bind="attrs">
    <template #content>
      <div max-w-200>{{text}}</div>
    </template>
    <span>
      <span truncate>{{text}}</span>
    </span>
  </ElTooltip>
</template>

<style scoped lang="scss">
</style>
