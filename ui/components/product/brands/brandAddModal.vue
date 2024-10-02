<template>
  <div class="brand-add-modal">
    <h3 style="margin-top: 0">Create Brand</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form :model="formData" @submit.prevent="handleSubmit" layout="vertical">
      <a-form-item
        name="name"
        label="Brand Name"
        :rules="[
          { required: true, message: 'Please input the brand name!' },
          { max: MAX_BRAND_NAME_LENGTH, message: `Brand name cannot exceed ${MAX_BRAND_NAME_LENGTH} characters!` }
        ]"
      >
        <a-input
          v-model:value="formData.name"
          placeholder="Enter brand name"
          :maxLength="MAX_BRAND_NAME_LENGTH"
        >
        </a-input>
      </a-form-item>

      <a-form-item
        name="description"
        label="Description"
        :rules="[
          { required: true, message: 'Please input the brand description!' },
          { max: MAX_BRAND_DESCRIPTION_LENGTH, message: `Description cannot exceed ${MAX_BRAND_DESCRIPTION_LENGTH} characters!` }
        ]"
      >
        <a-textarea
          v-model:value="formData.description"
          :rows="4"
          placeholder="Enter brand description"
          :maxLength="MAX_BRAND_DESCRIPTION_LENGTH"
        />
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          :loading="brandStore.loading"
          block
          size="large"
        >
          <template #icon><PlusOutlined /></template>
          Add Brand
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBrandStore } from '~/stores/product/BrandStore.js';
import { PlusOutlined } from '@ant-design/icons-vue';

const brandStore = useBrandStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();

// Constants
const MAX_BRAND_NAME_LENGTH = 100;
const MAX_BRAND_DESCRIPTION_LENGTH = 500;

const formData = ref({
  name: '',
  description: '',
});

const handleSubmit = async () => {
  try {
    if (!formData.value.name.trim() || !formData.value.description.trim()) {
      throw new Error('Brand name and description are required.');
    }

    const sanitizedData = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim()
    };

    await brandStore.createBrand(sanitizedData);

    formData.value = { name: '', description: '' };
    emit('submit-success');
    $toast.success('Brand added successfully!');
  } catch (error) {
    console.error('Error Adding Brand:', error);
    $toast.error(error.message || 'Error Creating Brand');
  }
};
</script>

<style scoped>
.brand-add-modal {
  max-width: 500px;
  margin: 0 auto;
}
</style>
