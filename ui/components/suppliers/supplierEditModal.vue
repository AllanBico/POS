
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
import { ref, onMounted, watch } from 'vue';
import { useSupplierStore } from '~/stores/product/SupplierStore.js';

const supplierStore = useSupplierStore();
const emit = defineEmits(['submit-success']);
const props = defineProps({
  supplier_id: {
    type: Number,
    required: true,
  },
});
const supplierId = ref(props.supplier_id); // Make supplierId reactive
const form = ref({
  name: '',
  contact: '',
  email: '',
  phone: '',
  address: '',
  status: '',
});

const error = ref(null);

const fetchSupplier = async () => {
  try {
    const fetchedCategory = supplierStore.SupplierById(supplierId.value);
    if (fetchedCategory) {
      form.value = { ...fetchedCategory}; // Populate the form with existing user data
    } else {
      error.value = 'Supplier not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Supplier';
  }
};

// Watch for changes in supplierId prop to refetch user data
watch(() => props.supplier_id, (newSupplierId) => {
  supplierId.value = newSupplierId;
  fetchSupplier();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    await supplierStore.updateSupplier(supplierId.value, form.value);
    if (supplierStore.error) {
      error.value = supplierStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Supplier';
  }
};

// Initial fetch on mount
onMounted(fetchSupplier);
</script>
