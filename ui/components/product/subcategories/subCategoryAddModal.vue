<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Category">
      <a-select
          v-model="form.categoryId"
          placeholder="Select a category"
          @change="handleCategoryChange"
      >
        <a-select-option
            v-for="category in categoryStore.categories"
            :key="category.id"
            :value="category.id"
        >
          {{ category.name }}
        </a-select-option>
      </a-select>

    </a-form-item>
    <a-form-item label="Name" :rules="[{ required: true, message: 'Please input your name!' }]">
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
import {ref} from 'vue';
import {useSubcategoryStore} from '~/stores/product/SubcategoryStore.js';

const subCategoryStore = useSubcategoryStore();
import {useCategoryStore} from '~/stores/product/CategoryStore.js';

const categoryStore = useCategoryStore();
const emit = defineEmits(['submit-success']);
categoryStore.fetchCategories()
const form = ref({
  name: '',
  description: '',
  categoryId: null,
});

const handleCategoryChange = (value) => {
  form.value.categoryId = value;
  console.log('Selected category ID:', value);
};

const handleSubmit = async () => {
  try {

    console.log("form.value", form.value)
    // Validate that all fields are filled
    if (!form.value.name || !form.value.description || !form.value.categoryId) {
      throw new Error('All fields are required.');
    }

    // Call the store method to add the user
    await subCategoryStore.createSubcategory(form.value);

    // Reset form
    form.value = {name: '', description: ''};

    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    console.error('Error adding user:', error);
    // Optionally, show an error message to the user
  }
};
</script>


<style scoped>
/* Add any custom styles if needed */
</style>
