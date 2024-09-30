<template>

  <a-divider style="margin-bottom: 8px; margin-top: 8px" />
  <a-form
    :model="formData"
    @submit.prevent="handleSubmit"
    layout="vertical"
    class="brand-add-form"
  >
    <a-form-item
      label="Brand Name"
      name="name"
      :rules="brandNameRules"
    >
      <a-input
        v-model:value="formData.name"
        placeholder="Enter brand name"
        :maxlength="MAX_BRAND_NAME_LENGTH"
      />
    </a-form-item>
    <a-form-item
      label="Brand Description"
      name="description"
      :rules="brandDescriptionRules"
    >
      <a-textarea
        :rows="4"
        v-model:value="formData.description"
        placeholder="Enter brand description"
        :maxlength="MAX_BRAND_DESCRIPTION_LENGTH"
      />
    </a-form-item>
    <a-divider />
    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="brandStore.loading">
        Add Brand
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useBrandStore } from '~/stores/product/BrandStore.js';


// Constants
const MAX_BRAND_NAME_LENGTH = 100;
const MAX_BRAND_DESCRIPTION_LENGTH = 500;

// Composables

const brandStore = useBrandStore();
const emit = defineEmits(['submit-success']);

// Form data and validation rules
const formData = ref({
  name: '',
  description: '',
});

const brandNameRules = [
  { required: true, message: 'Please input the brand name!' },
  { max: MAX_BRAND_NAME_LENGTH, message: `Brand name cannot exceed ${MAX_BRAND_NAME_LENGTH} characters!` }
];

const brandDescriptionRules = [
  { required: true, message: 'Please input the brand description!' },
  { max: MAX_BRAND_DESCRIPTION_LENGTH, message: `Description cannot exceed ${MAX_BRAND_DESCRIPTION_LENGTH} characters!` }
];

// Form validation
const validateForm = () => {
  if (!formData.value.name.trim() || !formData.value.description.trim()) {
    throw new Error('All fields are required and cannot be empty.');
  }
};

// Form reset
const resetForm = () => {
  formData.value = { name: '', description: '' };
};

// Sanitize input
const sanitizeInput = (input) => {
  // Implement appropriate sanitization logic here
  return input.trim();
};

// Main submit handler
const handleSubmit = async () => {
  try {
    validateForm();

    const sanitizedData = {
      name: sanitizeInput(formData.value.name),
      description: sanitizeInput(formData.value.description)
    };

    // Call the store method to add the brand
    await brandStore.createBrand(sanitizedData);

    resetForm();
    emit('submit-success');
  } catch (error) {
    console.error('Error adding brand:', error);
  }
};
</script>

<style scoped>
.brand-add-form {
  max-width: 500px;
  margin: 0 auto;
}
</style>
