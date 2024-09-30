<template>
  <div class="user-add-modal">
    <h3>Create User</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form :model="form" @submit.prevent="handleSubmit" layout="vertical">
      <a-form-item
        name="name"
        label="Name"
        :rules="[{ required: true, message: 'Please input the user name!' }]"
      >
        <a-input
          v-model:value="form.name"
          placeholder="Enter user name"
          :maxLength="50"
        >
        </a-input>
      </a-form-item>

      <a-form-item
        name="email"
        label="Email"
        :rules="[
          { required: true, message: 'Please input the user email!' },
          { type: 'email', message: 'Please enter a valid email!' }
        ]"
      >
        <a-input
          v-model:value="form.email"
          placeholder="Enter user email"
          :maxLength="100"
        >
        </a-input>
      </a-form-item>

      <a-form-item
        name="password"
        label="Password"
        :rules="[{ required: true, message: 'Please input the password!' }]"
      >
        <a-input-password
          v-model:value="form.password"
          placeholder="Enter password"
          :maxLength="50"
        >
        </a-input-password>
      </a-form-item>

      <a-form-item
        name="confirmPassword"
        label="Confirm Password"
        :rules="[
          { required: true, message: 'Please confirm your password!' },
          { validator: validatePasswordConfirmation }
        ]"
      >
        <a-input-password
          v-model:value="form.confirmPassword"
          placeholder="Confirm password"
          :maxLength="50"
        >
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
          block
          size="large"
        >
          <template #icon><UserAddOutlined /></template>
          Add User
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '~/stores/UserStore.js';
import { UserAddOutlined } from '@ant-design/icons-vue';

const userStore = useUserStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();
const loading = ref(false);
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
    if (!form.value.name || !form.value.email || !form.value.password || !form.value.confirmPassword) {
      throw new Error('All fields are required.');
    }
    if (form.value.password !== form.value.confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    loading.value = true;

    await userStore.addUser({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    });

    form.value = { name: '', email: '', password: '', confirmPassword: '' };
    emit('submit-success');
    $toast.success('User added successfully!');
  } catch (error) {
    console.error('Error Adding User:', error);
    $toast.error(error.message || 'Error Creating User');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
</style>
