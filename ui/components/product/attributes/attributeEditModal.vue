<template>
  <div class="attribute-edit-modal">
    <h3 style="margin-top: 0">Edit Attribute</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
      <a-form-item label="Name" :rules="[{ required: true, message: 'Please input the attribute name!' }]">
        <a-input v-model:value="form.name" placeholder="Enter attribute name" />
      </a-form-item>
      <a-form-item label="Description">
        <a-input v-model:value="form.description" placeholder="Enter attribute description" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" block size="large">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAttributesStore } from '~/stores/product/AttributeStore.js';
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
