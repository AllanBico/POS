<template>
  <div class="store-add-modal">
    <h3 style="margin-top: 0">Create Store</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form :model="form" @submit.prevent="handleSubmit" layout="vertical">
      <a-form-item
        name="name"
        label="Store Name"
        :rules="[{ required: true, message: 'Please input the store name!' }]"
      >
        <a-input
          v-model:value="form.name"
          placeholder="Enter store name"
          :maxLength="50"
        >
        </a-input>
      </a-form-item>

      <a-form-item
        name="location"
        label="Location"
        :rules="[{ required: true, message: 'Please input the store location!' }]"
      >
        <a-input
          v-model:value="form.location"
          placeholder="Enter store location"
          :maxLength="100"
        >
        </a-input>
      </a-form-item>

      <a-form-item name="description" label="Description">
        <a-textarea
          v-model:value="form.description"
          :rows="4"
          placeholder="Enter store description"
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
          Add Store
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStoreStore } from '~/stores/storesStore.js';
import { ShopOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons-vue';

const storeStore = useStoreStore();
const emit = defineEmits(['submit-success']);
const loading = ref(false);
const form = ref({
  name: '',
  location: '',
  description: '',
});

const handleSubmit = async () => {
  try {
    if (!form.value.name || !form.value.location) {
      throw new Error('Store name and location are required.');
    }
    loading.value = true;

    await storeStore.createStore({
      name: form.value.name,
      description: form.value.description,
      location: form.value.location
    });

    form.value = { name: '', location: '', description: '' };
    emit('submit-success');
  } catch (error) {
    console.error('Error Adding Store:', error);
    $toast.error(error.message || 'Error Creating Store');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
</style>
