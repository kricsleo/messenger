<script setup lang="ts">
import { ElDrawer } from 'element-plus'

defineProps<{
  title?: string
  modelValue: boolean
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()
</script>

<template>
  <ElDrawer 
    :modelValue="modelValue" @update:modelValue="emits('update:modelValue', $event)"
    size="80%"
    :showClose="false"
    destroyOnClose
    appendToBody>
    <template #header>
      <div y-center gap-10>
        <button @click="emits('update:modelValue', false)" expand-click>
          <div i-carbon:arrow-left op-85 hover:op-100 />
        </button>
        <h4 v-if="title" text="bold 18">{{ title }}</h4>
        <slot name="header" />
      </div>
    </template>
      <slot />
  </ElDrawer>
</template>
