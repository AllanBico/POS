<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Name" :rules="[{ required: true, message: 'Please input the store name!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>
    <a-form-item label="Location" :rules="[{ required: true, message: 'Please input the store location!' }]">
      <a-input v-model:value="form.location"/>
    </a-form-item>
    <a-form-item label="Description">
      <a-textarea :rows="4" v-model:value="form.description"/>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>


<script setup>
import { ref } from 'vue';
import { useStoreStore } from '~/stores/storesStore.js';

const storeStore = useStoreStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp()
const loading = ref(false);
const form = ref({
  name: '',
  location:'',
  description: '',
});


const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name || !form.value.location ) {
      throw new Error('All fields are required.');
    }
    loading.value = true

    // Call the store method to add the user
    await storeStore.createStore({
      name: form.value.name,
      description: form.value.description,
      location: form.value.location
    });

    // Reset form
    form.value = { name: '',location:'', description: '' };
    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    loading.value = false
    console.error('Error Adding Store:', error);
    $toast.error('Error Creating Store')
    // Optionally, show an error message to the user
  }
};
</script>


<style scoped>
/* Add any custom styles if needed */
</style>
