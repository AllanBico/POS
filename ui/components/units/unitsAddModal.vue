<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="name" :rules="[{ required: true, message: 'Please input your name!' }]">
      <a-input v-model:value="form.name" />
    </a-form-item>
    <a-form-item label="abbreviation" :rules="[{ required: true, message: 'Please input your abbreviation!' }]">
      <a-input v-model:value="form.abbreviation" />
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
import {useUnitStore} from '~/stores/Unit.js';
const UnitStore = useUnitStore();
const emit = defineEmits(['submit-success']);

const form = ref({
  name: '',
  description: '',
  abbreviation:'',
});


const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name || !form.value.description || !form.value.abbreviation ) {
      throw new Error('All fields are required.');
    }


    // Call the store method to add the user
    await UnitStore.createUnit({
      name: form.value.name,
      description: form.value.description,
      abbreviation: form.value.abbreviation,
    });

    // Reset form
    form.value = { name: '', description: '',abbreviation:'' };

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
