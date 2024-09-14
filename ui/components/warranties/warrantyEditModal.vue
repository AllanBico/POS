<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Name" :rules="[{ required: true, message: 'Please input warranty name!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>

    <a-form-item label="Duration" :rules="[{ required: true, message: 'Please input duration!' }]">
      <a-input-number v-model:value="form.duration"/>
    </a-form-item>

    <a-form-item label="Periods" :rules="[{ required: true, message: 'Please select period!' }]">
      <a-select v-model:value="form.periods">
        <a-select-option value="days">Days</a-select-option>
        <a-select-option value="months">Months</a-select-option>
        <a-select-option value="years">Years</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="Description">
      <a-textarea v-model:value="form.description" rows="4"/>
    </a-form-item>

    <a-form-item label="Status">
      <a-switch v-model:checked="form.status" checked-children="Active" un-checked-children="Inactive"/>
    </a-form-item>

    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import {useWarrantyStore} from '~/stores/WarrantyStore.js';

const emit = defineEmits(['submit-success']);
const props = defineProps({
  warranty_id: {
    type: Number,
    default: null,
  }
});

const warrantyStore = useWarrantyStore();
const warrantyId = ref(null)
const form = ref({
  name: '',
  duration: null,
  periods: 'months',
  description: '',
  status: true,
});
const fetchWarranty = async () => {
  try {
    console.log("fetch warranty")
    const fetchedWarranty = warrantyStore.warrantyById(props.warranty_id);
    if (fetchedWarranty) {
      form.value = { ...fetchedWarranty}; // Populate the form with existing user data
    } else {
      error.value = 'Unit not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Unit';
  }
};
onMounted(async () => {
  if (props.warranty_id) {
    await fetchWarranty()
  }
});
watch(() => props.warranty_id, (newWarrantyId) => {
  warrantyId.value = newWarrantyId;
  fetchWarranty();
}, { immediate: true });

const handleSubmit = async () => {
  try {

    await warrantyStore.updateWarranty(props.warranty_id, form.value);

    // Optionally, emit an event for success or navigate back
    emit('submit-success');
  } catch (error) {
    console.error('Error submitting warranty:', error);
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
