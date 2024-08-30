<template>
  <a-form
      :model="formState"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
  >
    <a-form-item
        label="email"
        name="email"
        :rules="[{ required: true, message: 'Please input your username!' }]"
    >
      <a-input v-model:value="formState.email" />
    </a-form-item>

    <a-form-item
        label="Password"
        name="password"
        :rules="[{ required: true, message: 'Please input your password!' }]"
    >
      <a-input-password v-model:value="formState.password" />
    </a-form-item>

    <a-form-item name="remember" :wrapper-col="{ offset: 8, span: 16 }">
      <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
    </a-form-item>

    <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { reactive } from 'vue';
import { useAuthStore } from '~/stores/useAuthStore.js';

const authStore = useAuthStore();
const formState = reactive({
  email: '',
  password: '',
  remember: true,
});
const onFinish = async values => {
  console.log('Success:', values);
  console.log('username:', values.email);
  console.log('password:', values.password);
  if (!values.email || !values.password) {
    authStore.error = 'Email and Password are required';
    return;
  }

  await authStore.login(values.email, values.password);

  if (!authStore.error) {
    // Redirect to another page if login is successful
    // Example: navigateTo('/');
  }
};
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
</script>