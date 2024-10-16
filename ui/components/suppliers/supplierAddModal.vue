<template>
  <div class="supplier-add-modal">
    <h3 style="margin-top: 0">Create Supplier</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
      <a-form-item
        label="Supplier Name"
        :rules="[{ required: true, message: 'Please input the supplier name!' }]"
      >
        <a-input v-model:value="form.name" placeholder="Enter supplier name" />
      </a-form-item>
      <a-form-item label="Contact">
        <a-input v-model:value="form.contact" placeholder="Enter contact person" />
      </a-form-item>
      <a-form-item label="Email">
        <a-input v-model:value="form.email" placeholder="Enter email address" />
      </a-form-item>
      <a-form-item label="Phone">
        <a-input v-model:value="form.phone" placeholder="Enter phone number" />
      </a-form-item>
      <a-form-item label="Address">
        <a-textarea :rows="4" v-model:value="form.address" placeholder="Enter address" />
      </a-form-item>
      <a-form-item label="Postal Code">
        <a-input v-model:value="form.postalCode" placeholder="Enter postal code" />
      </a-form-item>
      <a-form-item label="Tax ID">
        <a-input v-model:value="form.taxIdentificationNumber" placeholder="Enter tax ID" />
      </a-form-item>
      <a-form-item label="Status">
        <a-switch v-model:checked="form.status" checked-children="Active" un-checked-children="Inactive"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="supplierStore.loading" html-type="submit" block size="large">
          <template #icon><PlusOutlined /></template>
          Add Supplier
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { useSupplierStore } from '~/stores/product/SupplierStore.js';
import { PlusOutlined } from '@ant-design/icons-vue';

const supplierStore = useSupplierStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp()
const form = ref({
  name: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  postalCode:'',
  taxIdentificationNumber:'',
  status: 'true',
});


const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name || !form.value.email || !form.value.contact || !form.value.phone || !form.value.address || !form.value.postalCode || !form.value.taxIdentificationNumber) {
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
      postalCode:'',
      taxIdentificationNumber:'',
      status: 'true',
    };

    // Reset form
    form.value = { taxIdentificationNumber:'',postalCode:'',name: '', contact: '', email: '', phone: '', address: '' };
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
