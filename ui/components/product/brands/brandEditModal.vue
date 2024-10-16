<template>
  <div class="brand-edit-modal">
    <h3 style="margin-top: 0">Edit Brand</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form :model="form" @submit.prevent="handleSubmit" layout="vertical">
      <a-form-item
        name="name"
        label="Brand Name"
        :rules="[
          { required: true, message: 'Please input the brand name!' },
          { validator: validateNotEmpty }
        ]"
      >
        <a-input
          v-model:value="form.name"
          placeholder="Enter brand name"
          :maxLength="50"
        >
        </a-input>
      </a-form-item>

      <a-form-item
        name="description"
        label="Description"
        :rules="[
          { required: true, message: 'Please input the brand description!' },
          { validator: validateNotEmpty }
        ]"
      >
        <a-textarea
          v-model:value="form.description"
          :rows="4"
          placeholder="Enter brand description"
          :maxLength="500"
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
          <template #icon><EditOutlined /></template>
          Update Brand
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useBrandStore } from '~/stores/product/BrandStore.js';
import { EditOutlined } from '@ant-design/icons-vue';

const brandStore = useBrandStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();

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

// Fetch brand data based on the selected brand ID
const fetchBrand = async () => {
  try {
    const fetchedBrand = await brandStore.getBrandById(parseInt(brandId.value));
    if (fetchedBrand) {
      form.value = { ...fetchedBrand };
    } else {
      $toast.error('Brand not found');
    }
  } catch (err) {
    $toast.error(err.message || 'Failed to load brand');
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
      $toast.error(brandStore.error);
    } else {
      emit('submit-success');

    }
  } catch (err) {
    $toast.error(err.message || 'Failed to update brand');
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
  try {
    await updateBrand();
  } catch (error) {
    $toast.error('Please correct the errors in the form');
  }
};

// Initial fetch on mount
onMounted(fetchBrand);
</script>

<style scoped>
.brand-edit-modal {
  max-width: 500px;
  margin: 0 auto;
}
</style>
