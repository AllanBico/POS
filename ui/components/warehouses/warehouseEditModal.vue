<template>
  <div class="warehouse-edit-modal">
    <h3>Edit Warehouse</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form :model="form" @submit.prevent="handleSubmit" layout="vertical">
      <a-form-item
        name="name"
        label="Warehouse Name"
        :rules="[{ required: true, message: 'Please input the warehouse name!' }]"
      >
        <a-input
          v-model:value="form.name"
          placeholder="Enter warehouse name"
          :maxLength="50"
        >
        </a-input>
      </a-form-item>

      <a-form-item
        name="location"
        label="Location"
        :rules="[{ required: true, message: 'Please input the warehouse location!' }]"
      >
        <a-input
          v-model:value="form.location"
          placeholder="Enter warehouse location"
          :maxLength="100"
        >
        </a-input>
      </a-form-item>

      <a-form-item name="description" label="Description">
        <a-textarea
          v-model:value="form.description"
          :rows="4"
          placeholder="Enter warehouse description"
          :maxLength="500"
        />
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
          block
          size="large"
        >
          <template #icon><EditOutlined /></template>
          Update Warehouse
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useWarehouseStore } from '~/stores/WarehouseStore.js';
import { EditOutlined } from '@ant-design/icons-vue';

const warehouseStore = useWarehouseStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();
const loading = ref(false);

const props = defineProps({
  warehouse_id: {
    type: Number,
    required: true,
  },
});

const warehouseId = ref(props.warehouse_id);
const form = ref({
  name: '',
  location: '',
  description: '',
});

const fetchWarehouse = async () => {
  try {
    loading.value = true;
    const fetchedWarehouse = await warehouseStore.getWarehouseById(warehouseId.value);
    if (fetchedWarehouse) {
      form.value = { ...fetchedWarehouse };
    } else {
      throw new Error('Warehouse not found');
    }
  } catch (error) {
    console.error('Error Fetching Warehouse:', error);
    $toast.error(error.message || 'Failed to load Warehouse');
  } finally {
    loading.value = false;
  }
};

watch(() => props.warehouse_id, (newWarehouseId) => {
  warehouseId.value = newWarehouseId;
  fetchWarehouse();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    if (!form.value.name || !form.value.location) {
      throw new Error('Warehouse name and location are required.');
    }
    loading.value = true;

    await warehouseStore.updateWarehouse(warehouseId.value, {
      name: form.value.name,
      description: form.value.description,
      location: form.value.location
    });

    emit('submit-success');
    $toast.success('Warehouse updated successfully!');
  } catch (error) {
    console.error('Error Updating Warehouse:', error);
    $toast.error(error.message || 'Error Updating Warehouse');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchWarehouse);
</script>

<style scoped>
</style>
