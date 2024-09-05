<script setup>
import PageHeader from "~/components/layout/pageHeader.vue";

definePageMeta({
  middleware: 'auth'
});


</script>

<template>
<!--  <a-layout-header :style="{ background: '#fff', padding: 0 }" > </a-layout-header>-->
  <categories-table></categories-table>

</template>

<style scoped>

</style>