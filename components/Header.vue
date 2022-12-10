<script setup lang="ts">
import MenuLink from './MenuLink.vue';

</script>

<template>
  <header sticky top-0 bg-white dark:bg-dark z-2 shadow-sm shadow-gray-1 dark:shadow-gray-7 normalize-scroll>
    <div max-w-1000 m-auto flex items-center>
      <img src="/favicon.svg" w-40 h-40 rounded-full >
      <!-- <h1 ml-12 text-20 mr-auto>Messenger</h1> -->
      <MenuLink to="/" ml-auto>Messengers</MenuLink>
      <MenuLink to="/playground">Playground</MenuLink>
      <button @click="toggleDark()" dark:i-carbon-moon i-carbon-sun ml-15 text-20 />
    </div>
  </header>
</template>
