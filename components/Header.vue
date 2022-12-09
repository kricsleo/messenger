<script setup lang="ts">
</script>

<template>
  <header sticky top-0 bg-white dark:bg-dark z-1 shadow-sm shadow-gray-1 dark:shadow-gray-7>
    <div max-w-1000 m-auto flex items-center py-5>
      <img src="/favicon.svg" w-40 h-40 rounded-full >
      <h1 ml-10 text-20>Messenger</h1>
      <button @click="toggleDark()" dark:i-carbon-moon i-carbon-sun ml-auto text-20 />
    </div>
  </header>
</template>
