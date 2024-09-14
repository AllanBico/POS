<template>
  <a-form :form="form" @submit.prevent="updateRole">
    <a-form-item label="Role Name" :rules="[{ required: true, message: 'Please input the role name!' }]">
      <a-input v-model:value="form.name" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoleStore } from '~/stores/RoleStore.js'; // Adjust this import if necessary

const emit = defineEmits(['submit-success']);
const props = defineProps({
  role_id: {
    type: Number,
    required: true,
  },
});

const roleId = ref(props.role_id); // Make roleId reactive
const roleStore = useRoleStore();
const form = ref({
  name: '',
});

const error = ref(null);

const fetchRole = async () => {
  try {
    const fetchedRole = await roleStore.getRoleById(roleId.value); // Fetch role by ID
    if (fetchedRole) {
      form.value = { name: fetchedRole.name }; // Populate the form with existing role data
    } else {
      error.value = 'Role not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load role';
  }
};

// Watch for changes in roleId prop to refetch role data
watch(() => props.role_id, (newRoleId) => {
  roleId.value = newRoleId;
  fetchRole();
}, { immediate: true });

const updateRole = async () => {
  try {
    await roleStore.updateRole(roleId.value, form.value); // Update role using roleStore
    if (roleStore.error) {
      error.value = roleStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update role';
  }
};

// Initial fetch on mount
onMounted(fetchRole);
</script>
