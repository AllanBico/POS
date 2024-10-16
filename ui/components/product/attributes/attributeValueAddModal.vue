<template>
  <div class="attribute-value-add-modal">
    <h3 style="margin-top: 0">Create Attribute Value</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
      <a-form-item
        label="Value"
        :rules="[{ required: true, message: 'Please input the attribute value!' }]"
      >
        <a-input v-model:value="form.value" placeholder="Enter attribute value" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="attributesStore.loading" html-type="submit" block size="large">
          <template #icon><PlusOutlined /></template>
          Add Attribute Value
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
const props = defineProps({
  attribute_id: {
    type: Number,
    required: true,
  },
});
const attribute_id = props.attribute_id;
const form = ref({
  value: '',
  attributeId: attribute_id,
});

const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.value) {
      throw new Error('Value field is required.');
    }

    // Call the store method to add the attribute value
    await attributesStore.createAttributeValue(form.value);

    // Reset form
    form.value = { value: '', attributeId: attribute_id };
    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    console.error('Error adding Attribute Value:', error);
    $toast.error('Error Creating Attribute Value');
    // Optionally, show an error message to the user
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
