<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="name" :rules="[{ required: true, message: 'Please input your name!' }]">
      <a-input v-model:value="form.name" />
    </a-form-item>
    <a-form-item label="Email" :rules="[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]">
      <a-input v-model:value="form.email" />
    </a-form-item>
    <a-form-item label="Password" :rules="[{ required: true, message: 'Please input your password!' }]">
      <a-input type="password" v-model:value="form.password" />
    </a-form-item>
    <a-form-item label="Confirm Password" :rules="[{ required: true, message: 'Please confirm your password!' }, { validator: validatePasswordConfirmation }]">
      <a-input type="password" v-model:value="form.confirmPassword" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>


<script setup>
import { ref } from 'vue';
import { useUserStore } from '~/stores/UserStore.js';

const userStore = useUserStore();
const emit = defineEmits(['submit-success']);

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const validatePasswordConfirmation = (_, value) => {
  if (value && value !== form.value.password) {
    return Promise.reject(new Error('Passwords do not match!'));
  }
  return Promise.resolve();
};

const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name || !form.value.email || !form.value.password || !form.value.confirmPassword) {
      throw new Error('All fields are required.');
    }

    // Validate password confirmation
    if (form.value.password !== form.value.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    // Call the store method to add the user
    await userStore.addUser({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    });

    // Reset form
    form.value = { name: '', email: '', password: '', confirmPassword: '' };

    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    console.error('Error adding user:', error);
    // Optionally, show an error message to the user
  }
};
</script>


<style scoped>
/* Add any custom styles if needed */
</style>
