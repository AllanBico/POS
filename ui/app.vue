<template>
  <Toaster richColors   position="top-right" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
import {Toaster} from "vue-sonner";
</script>
<style>
html {
  padding: 0;
  margin: 0;
  font-size: 0.6rem;
}

</style>