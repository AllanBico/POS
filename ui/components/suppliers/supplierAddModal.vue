<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Name" :rules="[{ required: true, message: 'Please input the supplier name!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>
    <a-form-item label="Contact">
      <a-input v-model:value="form.contact"/>
    </a-form-item>
    <a-form-item label="Email">
      <a-input v-model:value="form.email"/>
    </a-form-item>
    <a-form-item label="Phone">
      <a-input v-model:value="form.phone"/>
    </a-form-item>
    <a-form-item label="Address">
      <a-textarea :rows="4" v-model:value="form.address"/>
    </a-form-item>
    <a-form-item label="Status">
      <a-switch v-model:checked="form.status" checked-children="Active" un-checked-children="Inactive"/>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>


<script setup>
import { ref } from 'vue';
import { useSupplierStore } from '~/stores/supplier.js';

const supplierStore = useSupplierStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp()
const form = ref({
  name: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  status: 'true',
});


const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name || !form.value.email ) {
      throw new Error('All fields are required.');
    }


    // Call the store method to add the user
    await supplierStore.createSupplier(form.value);
    form.value = {
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
    };

    // Reset form
    form.value = { name: '', contact: '', email: '', phone: '', address: '' };
    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    console.error('Error adding Supplier:', error);
    $toast.error('Error Creating Supplier')
    // Optionally, show an error message to the user
  }
};
</script>


<style scoped>
/* Add any custom styles if needed */
</style>
