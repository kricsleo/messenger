<script setup lang="ts">
const props = defineProps<{
  to: string
}>()
const route = useRoute()
const active = computed(() => route.path === props.to)
</script>

<template>
  <NuxtLink 
    :to="to"
    :class="['text-gray-6 dark:text-gray-2 text-20 opacity-60 hover:opacity-100 px-15 py-10 transition-opacity', { '!opacity-100': active }]">
    <slot />
  </NuxtLink>
</template>
