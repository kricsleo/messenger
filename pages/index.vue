<script setup lang="ts">
import MessengerList from '~~/components/MessengerList.vue';


</script>

<template>
  <!-- messenger list -->
  <section border rounded-4>
    <h2 border-b p-10 text="bold 20"> Messengers </h2>
    <MessengerList :fetcher="() => myFetch('/api/get-messengers')" />
  </section>
</template>
