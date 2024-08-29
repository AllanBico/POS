<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@nuxtjs/auth-next'

const email = ref('')
const password = ref('')
const error = ref('')

const { login } = useAuth()

const handleLogin = async () => {
  try {
    await login({
      data: {
        email: email.value,
        password: password.value
      }
    })
  } catch (e) {
    error.value = 'Invalid email or password'
  }
}
</script>
