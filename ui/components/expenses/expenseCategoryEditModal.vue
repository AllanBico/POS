<template>
  <div class="category-edit-modal">
    <h3 style="margin-top: 0">Edit Expense Category</h3>
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
import { useExpenseCategoryStore } from '~/stores/expenses/ExpenseCategory.js';

const categoryStore = useExpenseCategoryStore();
const emit = defineEmits(['submit-success']);
const props = defineProps({
  category_id: {
    type: Number,
    required: true,
  },
});
const categoryId = ref(props.category_id); // Make categoryId reactive
const form = ref({
  name: '',
  description: '',
});
const loading = ref(false);
const error = ref(null);

const fetchCategory = async () => {
  try {
    loading.value = true;
    const fetchedCategory = categoryStore.ExpenseCategoryById(categoryId.value);
    if (fetchedCategory) {
      form.value = { ...fetchedCategory }; // Populate the form with existing user data
    } else {
      error.value = 'Category not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Category';
  } finally {
    loading.value = false;
  }
};

// Watch for changes in categoryId prop to refetch user data
watch(() => props.category_id, (newcategoryId) => {
  categoryId.value = newcategoryId;
  fetchCategory();
}, { immediate: true });

const updateCategory = async () => {
  try {
    loading.value = true;
    await categoryStore.updateExpenseCategory(categoryId.value, form.value);
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

// Initial fetch on mount
onMounted(fetchCategory);
</script>
