<script setup>
const routes = [
  {
    path: 'index',
    breadcrumbName: 'First-level Menu',
  },
  {
    path: 'first',
    breadcrumbName: 'Second-level Menu',
  },
  {
    path: 'second',
    breadcrumbName: 'Third-level Menu',
  },
];
</script>

<template>
  <a-page-header
      style="border: 1px solid rgb(235, 237, 240)"
      title="Title"
      :breadcrumb="{ routes }"
      sub-title="This is a subtitle"
  />
</template>

<style scoped>

</style>