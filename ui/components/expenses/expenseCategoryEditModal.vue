<template>
  <a-form :form="form" @submit.prevent="updateCategory">
    <a-form-item label="name" :rules="[{ required: true, message: 'Please input your name!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>
    <a-form-item label="Description" :rules="[{ required: true, message: 'Please input your description!' }]">
      <a-textarea :rows="4" v-model:value="form.description"/>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import {ref, onMounted, watch} from 'vue';
import {useExpenseCategoryStore} from '@/stores/expenseCategory';

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

const error = ref(null);

const fetchCategory = async () => {
  try {
    const fetchedCategory = categoryStore.ExpenseCategoryById(categoryId.value);
    if (fetchedCategory) {
      form.value = {...fetchedCategory}; // Populate the form with existing user data
    } else {
      error.value = 'Category not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Category';
  }
};

// Watch for changes in categoryId prop to refetch user data
watch(() => props.category_id, (newcategoryId) => {
  categoryId.value = newcategoryId;
  fetchCategory();
}, {immediate: true});

const updateCategory = async () => {
  try {
    await categoryStore.updateExpenseCategory(categoryId.value, form.value);


    if (categoryStore.error) {
      error.value = categoryStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update user';
  }
};

// Initial fetch on mount
onMounted(fetchCategory);
</script>
