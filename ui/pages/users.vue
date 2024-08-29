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
import { useUserStore } from '~/stores/useUserStore.js';


const userStore = useUserStore();

// Fetch users when the component is mounted
userStore.fetchUsers();
</script>

<template>
  <a-page-header
      style="border: 1px solid rgb(235, 237, 240)"
      title="Title"
      :breadcrumb="{ routes }"
      sub-title="This is a subtitle"
  />
  <users-table :users="userStore.users" />
</template>

<style scoped>

</style>