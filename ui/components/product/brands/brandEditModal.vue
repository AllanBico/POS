
<template>
  <a-form :form="form" @submit.prevent="updateBrand">
    <a-form-item label="name" :rules="[{ required: true, message: 'Please input your name!' }]">
      <a-input  v-model:value="form.name" />
    </a-form-item>
    <a-form-item label="Description" :rules="[{ required: true, message: 'Please input your description!' }]">
      <a-textarea :rows="4" v-model:value="form.description" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useBrandStore } from '~/stores/product/BrandStore.js';
const brandStore = useBrandStore();
const emit = defineEmits(['submit-success']);
const props = defineProps({
  brand_id: {
    type: Number,
    required: true,
  },
});
const brandId = ref(props.brand_id); // Make brandId reactive
const form = ref({
  name: '',
  description: '',
});

const error = ref(null);

const fetchBrand = async () => {
  try {
    const fetchedBrand = brandStore.BrandById(brandId.value);
    if (fetchedBrand) {
      form.value = { ...fetchedBrand }; // Populate the form with existing user data
    } else {
      error.value = 'Brand not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Brand';
  }
};

// Watch for changes in brandId prop to refetch user data
watch(() => props.brand_id, (newbrandId) => {
  brandId.value = newbrandId;
  fetchBrand();
}, { immediate: true });

const updateBrand = async () => {
  try {
    await brandStore.updateBrand(brandId.value, form.value);


    if (brandStore.error) {
      error.value = brandStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update user';
  }
};

// Initial fetch on mount
onMounted(updateBrand);
</script>
