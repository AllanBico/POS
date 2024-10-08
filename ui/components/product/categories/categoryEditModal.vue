<template>
  <div class="category-edit-modal">
    <h3 style="margin-top: 0">Edit Category</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="updateCategory">
      <a-form-item label="Category Name" :rules="[{ required: true, message: 'Please input your name!' }]">
        <a-input v-model:value="form.name" placeholder="Enter category name" />
      </a-form-item>
      <a-form-item label="Description" :rules="[{ required: true, message: 'Please input your description!' }]">
        <a-textarea :rows="4" v-model:value="form.description" placeholder="Enter category description" />
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
import { useCategoryStore } from '~/stores/product/CategoryStore.js';

const categoryStore = useCategoryStore();
const emit = defineEmits(['submit-success']);
const props = defineProps({
  category_id: {
    type: Number,
    required: true,
  },
});
const categoryId = ref(props.category_id);
const form = ref({
  name: '',
  description: '',
});
const loading = ref(false);
const error = ref(null);

const fetchCategory = async () => {
  try {
    loading.value = true;
    const fetchedCategory = categoryStore.CategoryById(parseInt(props.category_id));
    console.log('parseInt(props.category_id)',props.category_id)
    console.log('fetchedCategory',fetchedCategory)
    if (fetchedCategory) {
      form.value = { ...fetchedCategory };
    } else {
      error.value = 'Category not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Category';
  } finally {
    loading.value = false;
  }
};

watch(() => props.category_id, (newCategoryId) => {
  categoryId.value = newCategoryId;
  fetchCategory();
}, { immediate: true });

const updateCategory = async () => {
  try {
    loading.value = true;
    await categoryStore.updateCategory(categoryId.value, form.value);
    if (categoryStore.error) {
      error.value = categoryStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update category';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCategory);
</script>
