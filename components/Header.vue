<script setup lang="ts">
import MenuLink from './MenuLink.vue';

</script>

<template>
  <header sticky top-0 bg-white dark:bg-dark z-2 shadow-sm shadow-gray-1 dark:shadow-gray-7 normalize-scroll>
    <div max-w-1044 m-auto px-10 flex items-center gap-15 text-20>
      <img src="/favicon.png" w-40 h-40 >
      <!-- <h1 ml-12 text-20 mr-auto>Messenger</h1> -->
      <MenuLink to="/" ml-auto>Messengers</MenuLink>
      <MenuLink to="/playground">Playground</MenuLink>
      <MenuLink to="/about">About</MenuLink>
      <a i-carbon:logo-github href="https://github.com/kricsleo/messenger" target="_blank" />
      <button @click="toggleDark()" dark:i-carbon-moon i-carbon-sun />
    </div>
  </header>
</template>
