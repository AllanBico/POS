<template>
  <div class="user-edit-modal">
    <h3>Edit User</h3>
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
          <template #icon><UserOutlined /></template>
          Update User
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '~/stores/UserStore.js';
import { UserOutlined } from '@ant-design/icons-vue';

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

const props = defineProps({
  user_id: {
    type: Number,
    required: true,
  },
});

const userId = ref(props.user_id);

const validatePasswordConfirmation = (_, value) => {
  if (value && value !== form.value.password) {
    return Promise.reject(new Error('Passwords do not match!'));
  }
  return Promise.resolve();
};

const fetchUser = async () => {
  try {
    const fetchedUser = userStore.userById(userId.value);
    if (fetchedUser) {
      form.value = { 
        name: fetchedUser.name,
        email: fetchedUser.email,
        password: '',
        confirmPassword: ''
      };
    } else {
      $toast.error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    $toast.error(error.message || 'Failed to load user');
  }
};

watch(() => props.user_id, (newUserId) => {
  userId.value = newUserId;
  fetchUser();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    if (!form.value.name || !form.value.email) {
      throw new Error('Name and email are required.');
    }
    if (form.value.password !== form.value.confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    loading.value = true;

    await userStore.updateUser(userId.value, {
      name: form.value.name,
      email: form.value.email,
      ...(form.value.password && { password: form.value.password })
    });

    emit('submit-success');
    $toast.success('User updated successfully!');
  } catch (error) {
    console.error('Error Updating User:', error);
    $toast.error(error.message || 'Error Updating User');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUser);
</script>

<style scoped>
</style>
