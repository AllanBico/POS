<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Category">
      <a-select
          v-model:value="form.categoryId"
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
      <a-button type="primary" html-type="submit">Update</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useSubcategoryStore } from '~/stores/product/SubcategoryStore.js';
import { useCategoryStore } from '~/stores/product/CategoryStore.js';
const subcategoryStore = useSubcategoryStore();
const categoryStore = useCategoryStore();
const router = useRouter();
const route = useRoute();
const emit = defineEmits(['submit-success']);
const form = ref({
  name: '',
  description: '',
  categoryId: null,
});
const props = defineProps({
  sub_category_id: {
    type: Number,
    required: true,
  },
});
// Fetch the subcategory ID from the route params or props
const subcategoryId = ref(props.sub_category_id);
// Watch for changes in categoryId prop to refetch user data
watch(() => props.sub_category_id, async (newsubCategoryId) => {
  subcategoryId.value = newsubCategoryId;
  await categoryStore.fetchCategories();
  if (newsubCategoryId) {
    await fetchSubcategory(subcategoryId);
  }
}, { immediate: true });
const handleCategoryChange = (value) => {
  form.value.categoryId = value;
  console.log('Selected category ID:', value);
};

const fetchSubcategory = async (id) => {
  try {

    const subcategory = await subcategoryStore.SubcategoryById(id.value);
    console.log("d",id.value)
    console.log("subcategory",subcategory)
    if (subcategory) {
      form.value = {
        name: subcategory.name,
        description: subcategory.description,
        categoryId: subcategory.categoryId,
      };
    }
    console.log("form.value",form.value)
  } catch (error) {
    console.error('Error fetching subcategory:', error);
  }
};

const handleSubmit = async () => {
  try {
    console.log("form.value", form.value);

    // Validate that all fields are filled
    if (!form.value.name || !form.value.description || !form.value.categoryId) {
      throw new Error('All fields are required.');
    }

    // Call the store method to update the subcategory
    await subcategoryStore.updateSubcategory(subcategoryId.value, form.value);

    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    console.error('Error updating subcategory:', error);
    // Optionally, show an error message to the user
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
