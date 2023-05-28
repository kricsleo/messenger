<script setup lang="ts">
import 'monaco-editor/esm/vs/editor/editor.all.js';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import jsonworker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import themeMonoco from './theme-monaco.json'
import { loadWASM } from 'onigasm' // peer dependency of 'monaco-textmate'
import { Registry } from 'monaco-textmate' // peer dependency
import { wireTmGrammars } from 'monaco-editor-textmate'

const props = defineProps<{
  language: 'json' | 'typescript'
  modelValue: string | undefined
}>()
const emits = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const editorRef = ref<HTMLDivElement>()

onMounted(async () => {
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if(label === 'json') {
        return new jsonworker()
      }
      if(label === 'typescript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }

  await loadWASM('https://cdn.jsdelivr.net/npm/onigasm@2.2.5/lib/onigasm.wasm') // See https://www.npmjs.com/package/onigasm#light-it-up
  const registry = new Registry({
    getGrammarDefinition: async (scopeName) => {
      return {
        format: 'json',
        content: await (await fetch(`https://cdn.jsdelivr.net/npm/shiki@0.14.2/languages/typescript.tmLanguage.json`)).text()
      }
    }
  })

  // map of monaco "language id's" to TextMate scopeNames
  const grammars = new Map()
  grammars.set('typescript', 'source.ts')

  // monaco's built-in themes aren't powereful enough to handle TM tokens
  // https://github.com/Nishkalkashyap/monaco-vscode-textmate-theme-converter#monaco-vscode-textmate-theme-converter
  monaco.editor.defineTheme('vs-code-theme-converted', themeMonoco as any);

  const editor = monaco.editor.create(editorRef.value!, {
    value: props.modelValue,
    language: props.language, // this won't work out of the box, see below for more info,
    theme: 'vs-code-theme-converted', // very important, see comment above
    // definitionLinkOpensInPeek: true,
    minimap: { enabled: false },
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 4,
    fontSize: 14,
    tabSize: 2,
  })

  monaco.languages.typescript.typescriptDefaults.setExtraLibs([{
    content: `declare interface Meta { author: string }`,
    filePath: 'types.d.ts'
  }])

  async function promiseRetry<T>(
  promise: () => Promise<T>,
  initial_retry_count: number,
  retry_delay: number,
): Promise<T> {
  async function __promiseRetry(promise: () => Promise<T>, remaining_retry_count: number): Promise<T> {
    try {
      const res = await promise();
      return res;
    } catch (e) {
      if (remaining_retry_count <= 0) {
        throw e;
      }
      setTimeout(() => {
        __promiseRetry(promise, remaining_retry_count - 1);
      }, retry_delay ** (1 + 0.1 * (initial_retry_count - remaining_retry_count + 1)));
    }
  }

  return __promiseRetry(promise, initial_retry_count);
}

// default async load ts will override `wireTmGrammars`
// so `wireTmGrammars` after default async load
await promiseRetry(
  async () => {
    await monaco.languages.typescript.getTypeScriptWorker();
  },
  5,
  10,
);
  await wireTmGrammars(monaco, registry, grammars, editor)
  
  // editor.onDidScrollChange()
  editor.onDidChangeModelContent(() => {
    const value = editor.getValue()
    emits('update:modelValue', value)
  })
})
</script>

<template>
  <div ref="editorRef" class="h-700" />
</template>