<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Role Name" :rules="[{ required: true, message: 'Please input the role name!' }]">
      <a-input v-model:value="form.name" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { ref } from 'vue';
import { useRoleStore } from '~/stores/RoleStore.js'; // Make sure this path is correct

const roleStore = useRoleStore();
const emit = defineEmits(['submit-success']);

const form = ref({
  name: '',
});

const handleSubmit = async () => {
  try {
    // Validate that the role name is filled
    if (!form.value.name) {
      throw new Error('Role name is required.');
    }

    // Call the store method to add the role
    await roleStore.createRole({
      name: form.value.name,
    });

    // Reset form
    form.value = { name: '' };

    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    console.error('Error adding role:', error);
    // Optionally, show an error message to the user
  }
};
</script>
