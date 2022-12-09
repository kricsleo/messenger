<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useAttrs } from 'vue';
import CopyBtn from './CopyBtn.vue';

const props = defineProps<{
  modelValue: string
  copyable?: boolean
}>()
const attrs = useAttrs()
const emits = defineEmits(['update:modelValue'])
const value = useVModel(props, 'modelValue', emits)

const extentions = [
  javascript({ typescript: true }),
  oneDark
]
</script>

<template>
  <div relative>
    <Codemirror
      class="editor"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extentions"
      v-model="value"
      v-bind="attrs"
    />
    <CopyBtn 
      v-if="copyable" 
      :modelValue="props.modelValue"
      tip="Copy code"
      class="absolute top-10 right-10 opacity-40 hover:opacity-100 text-20" />
  </div>
</template>

<style scoped>
.editor:deep(.cm-content) {
  padding: 0;
}
</style>
