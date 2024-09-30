<template>
  <div class="warehouse-add-modal">
    <h3>Create Warehouse</h3>
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
          <template #icon><PlusOutlined /></template>
          Add Warehouse
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useWarehouseStore } from '~/stores/WarehouseStore.js';
import { ShopOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons-vue';

const warehouseStore = useWarehouseStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();
const loading = ref(false);
const form = ref({
  name: '',
  location: '',
  description: '',
});

const handleSubmit = async () => {
  try {
    if (!form.value.name || !form.value.location) {
      throw new Error('Warehouse name and location are required.');
    }
    loading.value = true;

    await warehouseStore.createWarehouse({
      name: form.value.name,
      description: form.value.description,
      location: form.value.location
    });

    form.value = { name: '', location: '', description: '' };
    emit('submit-success');
    $toast.success('Warehouse added successfully!');
  } catch (error) {
    console.error('Error Adding Warehouse:', error);
    $toast.error(error.message || 'Error Creating Warehouse');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
</style>
