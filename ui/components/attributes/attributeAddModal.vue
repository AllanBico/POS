<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Name" :rules="[{ required: true, message: 'Please input the supplier name!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>
    <a-form-item label="Description">
      <a-input v-model:value="form.description"/>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { ref } from 'vue';
import { useAttributesStore } from '~/stores/attribute.js';
const attributesStore = useAttributesStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp()
const form = ref({
  name: '',
  description: '',
});
const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name  ) {
      throw new Error('Name field is required.');
    }


    // Call the store method to add the user
    await attributesStore.createAttribute(form.value);
    form.value = {
      name: '',
      description: '',
    };

    // Reset form
    form.value = { name: '', description: '' };
    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    console.error('Error adding Attribute:', error);
    $toast.error('Error Creating Attribute')
    // Optionally, show an error message to the user
  }
};
</script>


<style scoped>
/* Add any custom styles if needed */
</style>
