<script setup lang="ts">
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

const code = ref()
const extentions = [javascript({ typescript: true }), oneDark]
</script>

<template>
  <Codemirror 
    v-model="code"
    placeholder="Transformer code goes here..."
    :style="{ height: '400px' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extentions"
  />
  <pre>
    {{code}}
  </pre>
</template>

<style scoped lang="scss">
</style>
