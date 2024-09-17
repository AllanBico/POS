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
import { ref, onMounted, watch } from 'vue';
import { useTaxStore } from '~/stores/taxStore.js';

const TaxStore = useTaxStore();
const loading = ref(false);
const emit = defineEmits(['submit-success']);
const props = defineProps({
  tax_id: {
    type: Number,
    required: true,
  },
});

const taxId = ref(props.tax_id); // Make taxId reactive
const form = ref({
  name: '',
  rate:'',
  description: '',
});

const error = ref(null);

const fetchTax = async () => {
  try {
    const fetchedTax =  await TaxStore.fetchTaxById(taxId.value);
    if (fetchedTax) {
      form.value = { ...fetchedTax }; // Populate the form with existing user data
    } else {
      error.value = 'Tax not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Tax';
  }
};
fetchTax();
// Watch for changes in taxId prop to refetch user data
watch(() => props.tax_id, (newtaxId) => {
  taxId.value = newtaxId;
  fetchTax();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    await TaxStore.updateTax(taxId.value, form.value);

    if (TaxStore.error) {
      error.value = TaxStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Store';
  }
};
</script>