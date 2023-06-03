<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { useAttrs } from 'vue';
import CopyBtn from '~~/components/CopyBtn.vue';
import {materialLight} from '@ddietr/codemirror-themes/material-light'
import {materialDark} from '@ddietr/codemirror-themes/material-dark'

const props = defineProps<{
  modelValue?: string
  copyable?: boolean
}>()
const attrs = useAttrs()
const emits = defineEmits(['update:modelValue'])
const value = useVModel(props, 'modelValue', emits)
const extentions = computed(() => isDark.value 
  ? [ javascript({ typescript: true }), materialDark ] 
  : [javascript({ typescript: true }), materialLight]
)
</script>

<template>
  <div relative>
    <Codemirror
      class="editor"
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
      class="absolute top-20 right-20 text-20" />
  </div>
</template>

<style scoped lang="scss">
.editor:deep() {
  .cm-content {
    padding: 0;
  }
  .cm-editor {
    outline: none !important;
  }
}
</style>
