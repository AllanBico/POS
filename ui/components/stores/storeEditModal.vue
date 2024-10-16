<template>
  <div class="store-edit-modal">
    <h3>Update Store</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form :form="form" @submit.prevent="handleSubmit" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item
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
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item
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
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="Description">
            <a-textarea
              v-model:value="form.description"
              :rows="4"
              placeholder="Enter store description"
              :maxLength="500"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
          block
          size="large"
        >
          <template #icon><EditOutlined /></template>
          Update Store
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useStoreStore } from '~/stores/storesStore.js';
import { ShopOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons-vue';

const storeStore = useStoreStore();
const emit = defineEmits(['submit-success']);
const loading = ref(false);
const props = defineProps({
  store_id: {
    type: Number,
    required: true,
  },
});
const storeId = ref(props.store_id);
const form = ref({
  name: '',
  location: '',
  description: '',
});

const fetchStore = async () => {
  try {
    loading.value = true;
    const fetchedStore = storeStore.StoreById(storeId.value);
    if (fetchedStore) {
      form.value = { ...fetchedStore };
    } else {
      throw new Error('Store not found');
    }
  } catch (error) {
    console.error('Error Fetching Store:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.store_id, (newStoreId) => {
  storeId.value = newStoreId;
  fetchStore();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    if (!form.value.name || !form.value.location) {
      throw new Error('Store name and location are required.');
    }
    loading.value = true;

    await storeStore.updateStore(storeId.value, {
      name: form.value.name,
      description: form.value.description,
      location: form.value.location
    });

    emit('submit-success');
  } catch (error) {
    console.error('Error Updating Store:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStore);
</script>

<style scoped>
</style>
