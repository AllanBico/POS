<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Name" :rules="[{ required: true, message: 'Please input the tax name!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>
    <a-form-item label="Rate" :rules="[{ required: true, message: 'Please input the tax rate!' }]">
      <a-input v-model:value="form.rate"/>
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
import { useTaxStore } from '~/stores/taxStore.js';

const TaxStore = useTaxStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp()
const loading = ref(false);
const form = ref({
  name: '',
  rate:'',
  description: '',
});


const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name || !form.value.rate ) {
      throw new Error('All fields are required.');
    }
    loading.value = true

    // Call the store method to add the user
    await TaxStore.createTax({
      name: form.value.name,
      description: form.value.description,
      rate: form.value.rate
    });

    // Reset form
    form.value = { name: '',rate:'', description: '' };
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
