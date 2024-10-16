<template>
  <div class="supplier-edit-modal">
    <h3 style="margin-top: 0">Edit Supplier</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
      <a-form-item label="Supplier Name" :rules="[{ required: true, message: 'Please input the supplier name!' }]">
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
        <a-switch v-model:value="form.status" checked-children="Active" un-checked-children="Inactive"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="loading" html-type="submit" block size="large">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
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
  postalCode:'',
  taxIdentificationNumber:'',
  status: '',
});
const loading = ref(false);
const error = ref(null);

const fetchSupplier = async () => {
  try {
    loading.value = true;
    const fetchedCategory = supplierStore.SupplierById(supplierId.value);
    if (fetchedCategory) {
      form.value = { ...fetchedCategory, status: fetchedCategory.status === true ? 'Active' : 'Inactive' }; // Populate the form with existing user data
    } else {
      error.value = 'Supplier not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Supplier';
  } finally {
    loading.value = false;
  }
};

// Watch for changes in supplierId prop to refetch user data
watch(() => props.supplier_id, (newSupplierId) => {
  supplierId.value = newSupplierId;
  fetchSupplier();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    loading.value = true;
    // Convert status back to boolean before sending to the store
    form.value.status = form.value.status === 'Active';
    await supplierStore.updateSupplier(supplierId.value, form.value);
    if (supplierStore.error) {
      error.value = supplierStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Supplier';
  } finally {
    loading.value = false;
  }
};

// Initial fetch on mount
onMounted(fetchSupplier);
</script>
