<template>
  <a-divider/>
  <a-form
    :model="formData"
    @submit.prevent="handleSubmit"
    layout="vertical"
    class="brand-add-form"
  >
    <a-form-item
      label="Brand Name"
      name="name"
      :rules="[
        { required: true, message: 'Please input the brand name!' },
        { max: 100, message: 'Brand name cannot exceed 100 characters!' }
      ]"
    >
      <a-input
        v-model:value="formData.name"
        placeholder="Enter brand name"
        :maxlength="100"
      />
    </a-form-item>
    <a-form-item
      label="Brand Description"
      name="description"
      :rules="[
        { required: true, message: 'Please input the brand description!' },
        { max: 500, message: 'Description cannot exceed 500 characters!' }
      ]"
    >
      <a-textarea
        :rows="4"
        v-model:value="formData.description"
        placeholder="Enter brand description"
        :maxlength="500"
      />
    </a-form-item>
    <a-divider/>
    <a-form-item>
      <a-button type="primary" html-type="submit">
        Add Brand
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref } from 'vue';
import { useBrandStore } from '~/stores/product/BrandStore.js';
import { message } from 'ant-design-vue';
const { $toast } = useNuxtApp();
const brandStore = useBrandStore();
const emit = defineEmits(['submit-success']);

// Initialize form data with reactive properties
const formData = ref({
  name: '',
  description: '',
});

// Function to validate form data
const validateForm = () => {
  if (!formData.value.name.trim() || !formData.value.description.trim()) {
    throw new Error('All fields are required and cannot be empty.');
    
  }
};

// Function to reset form data
const resetForm = () => {
  formData.value = { name: '', description: '' };
};

// Main submit handler
const handleSubmit = async () => {
  try {
    validateForm();

    // Call the store method to add the brand
    await brandStore.createBrand({
      name: formData.value.name.trim(),
      description: formData.value.description.trim()
    });

    resetForm();
    emit('submit-success');
  } catch (error) {
    console.error('Error adding brand:', error);
    $toast.error(error.message || 'Failed to add brand. Please try again.');
  }
};
</script>

<style scoped>
.brand-add-form {
  max-width: 500px;
  margin: 0 auto;
}
</style>
