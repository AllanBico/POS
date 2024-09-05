<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Value" :rules="[{ required: true, message: 'Please input the attribute Value!' }]">
      <a-input v-model:value="form.value"/>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAttributesStore } from '~/stores/attribute.js';
const attributesStore = useAttributesStore();
const emit = defineEmits(['submit-success']);
const props = defineProps({
  attribute_value_id: {
    type: Number,
    required: true,
  },

});
const attributeValueId = ref(props.attribute_value_id); // Make attributeValueId reactive
const form = ref({
  value: '',
});

const error = ref(null);

const fetchupdateAttributeValue = async () => {
  try {
    const fetchedupdateAttributeValue = attributesStore.AttributeValueById(props.attribute_value_id);
    console.log("fetchedupdateAttributeValue",fetchedupdateAttributeValue)
    if (fetchedupdateAttributeValue) {
      form.value = { ...fetchedupdateAttributeValue}; // Populate the form with existing user data
    } else {
      error.value = 'Attribute Value not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Attribute Value';
  }
};

// Watch for changes in attributeValueId prop to refetch user data
watch(() => props.attribute_value_id, (newAttributeValueId) => {
  attributeValueId.value = newAttributeValueId;
  fetchupdateAttributeValue();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    await attributesStore.updateAttributeValue(attributeValueId.value, form.value);
    if (attributesStore.error) {
      error.value = attributesStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Attribute Value';
  }
};

// Initial fetch on mount
onMounted(fetchupdateAttributeValue);
</script>
