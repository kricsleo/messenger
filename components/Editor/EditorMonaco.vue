<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { editor as Editor } from 'monaco-editor/esm/vs/editor/editor.api'
import { createConfiguredEditor } from 'vscode/monaco'
import CopyBtn from '~~/components/CopyBtn.vue';

const props = withDefaults(defineProps<{
  language?: 'json' | 'typescript'
  modelValue?: string
  readonly?: boolean
  copyable?: boolean
}>(), { 
  language: 'typescript',
  modelValue: ''
})
const attrs = useAttrs()
const emits = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()
const editorRef = ref<HTMLDivElement>()
const copyBtnRef = ref<HTMLDivElement>()

onMounted(async () => {
  // Nuxt generates a global process variable, 
  // which conflicts with the judgement inside textmate.
  // Fix: https://github.com/microsoft/vscode-textmate/blob/b6bbee8d53c029d9279a0c9a998b78f05247d6d1/src/debug.ts#L6
  typeof process === 'object' && (process.env = process.env || {})
  await import('./setupMonaco')
  const editor = createConfiguredEditor(editorRef.value!, {
    value: props.modelValue,
    language: props.language,
    readOnly: props.readonly,
    automaticLayout: true,
    fontSize: 14,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 4,
    glyphMargin: false,
    tabSize: 2,
  })
  if(props.copyable) {
    const copyWidget: Editor.IOverlayWidget = {
      getId: () => 'monaco-copy-widget',
      getDomNode: () => copyBtnRef.value!,
      getPosition: () => ({preference: 0})
    }
    editor.addOverlayWidget(copyWidget);
  }
  editor.onDidChangeModelContent(() => {
    const value = editor.getValue()
    emits('update:modelValue', value)
  })
  watch(() => props.modelValue, () => {
    if(props.modelValue !== editor.getValue()) {
      editor.setValue(props.modelValue)
    }
  })
  return () => editor.dispose()
})

watch(isDark, () => {
  monaco.editor.setTheme(isDark.value ? 'dark' : 'light')
})
</script>

<template>
  <div ref="editorRef" v-bind="attrs" />
  <div v-if="copyable" ref="copyBtnRef">
    <CopyBtn :modelValue="props.modelValue" text-20 />
  </div>
</template>