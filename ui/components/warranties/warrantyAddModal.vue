<template>
  <div class="warranty-add-modal">
    <h3>Create Warranty</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form :model="form" @submit.prevent="handleSubmit" layout="vertical">
      <a-form-item
        name="name"
        label="Warranty Name"
        :rules="[{ required: true, message: 'Please input the warranty name!' }]"
      >
        <a-input
          v-model:value="form.name"
          placeholder="Enter warranty name"
          :maxLength="50"
        >
        </a-input>
      </a-form-item>

      <a-form-item
        name="duration"
        label="Duration"
        :rules="[{ required: true, message: 'Please input the warranty duration!' }]"
      >
        <a-input-number
          v-model:value="form.duration"
          placeholder="Enter warranty duration"
          :min="1"
        >
        </a-input-number>
      </a-form-item>

      <a-form-item
        name="periods"
        label="Period"
        :rules="[{ required: true, message: 'Please select the warranty period!' }]"
      >
        <a-select v-model:value="form.periods" placeholder="Select period">
          <a-select-option value="days">Days</a-select-option>
          <a-select-option value="months">Months</a-select-option>
          <a-select-option value="years">Years</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item name="description" label="Description">
        <a-textarea
          v-model:value="form.description"
          :rows="4"
          placeholder="Enter warranty description"
          :maxLength="500"
        />
      </a-form-item>

      <a-form-item name="status" label="Status">
        <a-switch
          v-model:checked="form.status"
          checked-children="Active"
          un-checked-children="Inactive"
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
          Add Warranty
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useWarrantyStore } from '~/stores/product/WarrantyStore.js';
import { PlusOutlined } from '@ant-design/icons-vue';

const warrantyStore = useWarrantyStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();
const loading = ref(false);
const form = ref({
  name: '',
  duration: null,
  periods: 'months',
  description: '',
  status: true,
});

const handleSubmit = async () => {
  try {
    if (!form.value.name || !form.value.duration || !form.value.periods) {
      throw new Error('Warranty name, duration, and period are required.');
    }
    loading.value = true;

    await warrantyStore.createWarranty(form.value);

    form.value = { name: '', duration: null, periods: 'months', description: '', status: true };
    emit('submit-success');
  } catch (error) {
    console.error('Error Adding Warranty:', error);
    $toast.error(error.message || 'Error Creating Warranty');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
</style>
