
<template>
  <a-form :form="form" @submit.prevent="updateUser">
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
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '~/stores/useUserStore';
const emit = defineEmits(['submit-success']);
const props = defineProps({
  user_id: {
    type: Number,
    required: true,
  },
});
const userId = ref(props.user_id); // Make userId reactive
const userStore = useUserStore();
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const error = ref(null);
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
      form.value = { ...fetchedUser }; // Populate the form with existing user data
    } else {
      error.value = 'User not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load user';
  }
};

// Watch for changes in userId prop to refetch user data
watch(() => props.user_id, (newUserId) => {
  userId.value = newUserId;
  fetchUser();
}, { immediate: true });

const updateUser = async () => {
  try {
    await userStore.updateUser(userId.value, form.value);
    if (userStore.error) {
      error.value = userStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update user';
  }
};

// Initial fetch on mount
onMounted(fetchUser);
</script>
