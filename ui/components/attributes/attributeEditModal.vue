<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Name" :rules="[{ required: true, message: 'Please input the attribute name!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>
    <a-form-item label="Description">
      <a-input v-model:value="form.description"/>
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
  attribute_id: {
    type: Number,
    required: true,
  },
});
const attributeId = ref(props.attribute_id); // Make attributeId reactive
const form = ref({
  name: '',
  description: '',
});

const error = ref(null);

const fetchAttribute = async () => {
  try {
    const fetchedAttribute = attributesStore.AttributeById(attributeId.value);
    if (fetchedAttribute) {
      form.value = { ...fetchedAttribute}; // Populate the form with existing user data
    } else {
      error.value = 'Attribute not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Attribute';
  }
};

// Watch for changes in attributeId prop to refetch user data
watch(() => props.attribute_id, (newAttributeId) => {
  attributeId.value = newAttributeId;
  fetchAttribute();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    await attributesStore.updateAttribute(attributeId.value, form.value);
    if (attributesStore.error) {
      error.value = attributesStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Attribute';
  }
};

// Initial fetch on mount
onMounted(fetchAttribute);
</script>
