<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Name" :rules="[{ required: true, message: 'Please input warehouse name!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>
    <a-form-item label="Location" :rules="[{ required: true, message: 'Please input warehouse location!' }]">
      <a-input v-model:value="form.location"/>
    </a-form-item>
    <a-form-item label="Description">
      <a-textarea :rows="4" v-model:value="form.description"/>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" :loading="loading" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import {useWarehouseStore} from '~/stores/warehouse.js';
const warehouseStore = useWarehouseStore();
const emit = defineEmits(['submit-success']);
const props = defineProps({
  warehouse_id: {
    type: Number,
    required: true,
  },
});
const warehouseId = ref(props.warehouse_id); // Make warehouseId reactive
const form = ref({
  name: '',
  location:'',
  description: '',
});

const error = ref(null);

const fetchWarehouse = async () => {
  try {
    const fetchedWarehouse = warehouseStore.WarehouseById(warehouseId.value);
    if (fetchedWarehouse) {
      form.value = { ...fetchedWarehouse }; // Populate the form with existing user data
    } else {
      error.value = 'Warehouse not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Warehouse';
  }
};

// Watch for changes in warehouseId prop to refetch user data
watch(() => props.warehouse_id, (newWarehouseId) => {
  warehouseId.value = newWarehouseId;
  fetchWarehouse();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    await warehouseStore.updateWarehouse(warehouseId.value, form.value);


    if (warehouseStore.error) {
      error.value = warehouseStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Warehouse';
  }
};

// Initial fetch on mount
onMounted(fetchWarehouse);
</script>
