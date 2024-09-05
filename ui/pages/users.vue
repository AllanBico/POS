<script setup>
definePageMeta({
  middleware: 'auth'
});
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
  <users-table :users="userStore.users" />
</template>

<style scoped>

</style>