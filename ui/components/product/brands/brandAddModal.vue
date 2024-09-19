<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="name" :rules="[{ required: true, message: 'Please input your name!' }]">
      <a-input v-model:value="form.name" />
    </a-form-item>
    <a-form-item label="Description" :rules="[{ required: true, message: 'Please input your description!' }]">
      <a-textarea :rows="4" v-model:value="form.description" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>


<script setup>
import { ref } from 'vue';
import { useBrandStore } from '~/stores/product/BrandStore.js';
const brandStore = useBrandStore();
const emit = defineEmits(['submit-success']);

const form = ref({
  name: '',
  description: '',
});


const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name || !form.value.description ) {
      throw new Error('All fields are required.');
    }


    // Call the store method to add the user
    await brandStore.createBrand({
      name: form.value.name,
      description: form.value.description
    });

    // Reset form
    form.value = { name: '', description: '' };

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
