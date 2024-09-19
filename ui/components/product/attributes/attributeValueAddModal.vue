<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Value" :rules="[{ required: true, message: 'Please input the attribute value!' }]">
      <a-input v-model:value="form.value"/>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { ref } from 'vue';
import { useAttributesStore } from '~/stores/product/AttributeStore.js';
const attributesStore = useAttributesStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp()


const props = defineProps({
  attribute_id: {
    type: Number,
    required: true,
  },
});
const  attribute_id = props.attribute_id
console.log("attribute_id",attribute_id.value)
const form = ref({
  value: '',
  attributeId: attribute_id,
});
const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.value  ) {
      throw new Error('Value field is required.');
    }
    // Call the store method to add the user
    await attributesStore.createAttributeValue(form.value);
    // Reset form
    form.value = { value: '',attributeId: attribute_id.value};
    // Emit event to close the modal if needed
    emit('submit-success');
  } catch (error) {
    console.error('Error adding Attribute Value:', error);
    $toast.error('Error Creating Attribute Value')
    // Optionally, show an error message to the user
  }
};
</script>


<style scoped>
/* Add any custom styles if needed */
</style>
