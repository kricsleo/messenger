<script setup lang="ts">
import MessengerList from '~~/components/MessengerList.vue';

const fetcher = () => $fetch('/api/get-messengers')
</script>

<template>
  <!-- messenger list -->
  <section border rounded-4>
    <h2 p-10 text="bold 20"> Messengers </h2>
    <MessengerList :fetcher="fetcher" />
  </section>
</template>
