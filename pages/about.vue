<script setup lang="ts">
import { html, toc } from '../about.md'
import '@kricsleo/markdown-themes'
</script>

<template>
  <section class="prose flex items-start gap-25">
    <article class="content" v-html="html" />
    <nav class="toc sticky top-100 w-200 shrink-0" v-html="toc" />
  </section>
</template>

<style scoped lang="scss">
.content:deep() {
  h1, h2, h3, h4, h5 {
    &::before {
      content: '';
      display: block;
      height: 70px;
      position: static;
      margin-top: -70px;
      visibility: hidden;
    }
  }
}
@media (max-width: 900px) {
  .toc {
    display: none;
  }
}
</style>
