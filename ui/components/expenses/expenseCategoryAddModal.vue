<template>
  <div class="category-add-modal">
    <h3 style="margin-top: 0">Create Expense Category</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
      <a-form-item
        label="Category Name"
        :rules="[{ required: true, message: 'Please input your name!' }]"
      >
        <a-input v-model:value="form.name" placeholder="Enter category name" />
      </a-form-item>
      <a-form-item
        label="Description"
        :rules="[{ required: true, message: 'Please input your description!' }]"
      >
        <a-textarea :rows="4" v-model:value="form.description" placeholder="Enter category description" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="loading" html-type="submit" block size="large">
          <template #icon><PlusOutlined /></template>
          Add Category
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { useExpenseCategoryStore } from '~/stores/expenses/ExpenseCategory.js'; // Assuming the store for categories
import { PlusOutlined } from '@ant-design/icons-vue';

const categoryStore = useExpenseCategoryStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp()
const loading = ref(false);
const form = ref({
  name: '',
  description: '',
});


const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name || !form.value.description ) {
      throw new Error('All fields are required.');
    }
    loading.value = true

    // Call the store method to add the user
    await categoryStore.createExpenseCategory({
      name: form.value.name,
      description: form.value.description
    });

    // Reset form
    form.value = { name: '', description: '' };
    // Emit event to close the modal if needed
    emit('submit-success');
    loading.value = false
  } catch  {
    loading.value = false
    console.error('Error adding Category:');
    //$toast.error('Error Creating Category')
    // Optionally, show an error message to the user
  }
};
</script>


<style scoped>
/* Add any custom styles if needed */
</style>
