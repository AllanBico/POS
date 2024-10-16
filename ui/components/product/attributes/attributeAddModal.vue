<template>
  <div class="attribute-add-modal">
    <h3 style="margin-top: 0">Create Attribute</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
      <a-form-item
        label="Name"
        :rules="[{ required: true, message: 'Please input the attribute name!' }]"
      >
        <a-input v-model:value="form.name" placeholder="Enter attribute name" />
      </a-form-item>
      <a-form-item label="Description">
        <a-input v-model:value="form.description" placeholder="Enter attribute description" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="attributesStore.loading" html-type="submit" block size="large">
          <template #icon><PlusOutlined /></template>
          Add Attribute
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useAttributesStore } from '~/stores/product/AttributeStore.js';
import { PlusOutlined } from '@ant-design/icons-vue';

const attributesStore = useAttributesStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();
const form = ref({
  name: '',
  description: '',
});

const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name) {
      throw new Error('Name field is required.');
    }

    // Call the store method to add the attribute
    await attributesStore.createAttribute(form.value);

    // Reset form
    form.value = { name: '', description: '' };
    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    console.error('Error adding Attribute:', error);
    $toast.error('Error Creating Attribute');
    // Optionally, show an error message to the user
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
