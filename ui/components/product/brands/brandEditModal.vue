<template>
  <a-divider />
  <a-form :model="form" @submit.prevent="handleSubmit" layout="vertical">
    <a-form-item
      label="Name"
      name="name"
      :rules="[
        { required: true, message: 'Please input the brand name!' },
        { validator: validateNotEmpty }
      ]"
    >
      <a-input v-model:value="form.name" />
    </a-form-item>
    <a-form-item
      label="Description"
      name="description"
      :rules="[
        { required: true, message: 'Please input the brand description!' },
        { validator: validateNotEmpty }
      ]"
    >
      <a-textarea :rows="4" v-model:value="form.description" />
    </a-form-item>
    <a-divider />
    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="brandStore.loading">Submit</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useBrandStore } from '~/stores/product/BrandStore.js';

const brandStore = useBrandStore();
const emit = defineEmits(['submit-success']);

const props = defineProps({
  selectedBrandId: {
    type: Number,
    required: true,
  },
});

const brandId = ref(props.selectedBrandId);
const form = ref({
  name: '',
  description: '',
});
const error = ref(null);

// Fetch brand data based on the selected brand ID
const fetchBrand = async () => {
  try {
    const fetchedBrand = brandStore.getBrandById(parseInt(brandId.value));
    if (fetchedBrand) {
      form.value = { ...fetchedBrand };
    } else {
      error.value = 'Brand not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load brand';
  }
};

// Watch for changes in selectedBrandId prop to refetch brand data
watch(
  () => props.selectedBrandId,
  (newBrandId) => {
    brandId.value = newBrandId;
    fetchBrand();
  },
  { immediate: true }
);

// Update brand data
const updateBrand = async () => {
  try {
    await brandStore.updateBrand(brandId.value, form.value);
    if (brandStore.error) {
      error.value = brandStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update brand';
  }
};

// Validate that the field is not empty or just whitespace
const validateNotEmpty = (rule, value) => {
  if (!value || value.trim() === '') {
    return Promise.reject('This field cannot be empty');
  }
  return Promise.resolve();
};

// Handle form submission
const handleSubmit = async () => {
  error.value = null; // Reset error before submission
  try {
    await form.value.validate();
    await updateBrand();
  } catch (validationError) {
    error.value = 'Please correct the errors in the form';
  }
};

// Initial fetch on mount
onMounted(fetchBrand);
</script>
