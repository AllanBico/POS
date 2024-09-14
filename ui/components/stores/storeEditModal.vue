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
import { useStoreStore } from '~/stores/storesStore.js';
const storeStore = useStoreStore();
const loading = ref(false);
const emit = defineEmits(['submit-success']);
const props = defineProps({
  store_id: {
    type: Number,
    required: true,
  },
});
const storeId = ref(props.store_id); // Make storeId reactive
const form = ref({
  name: '',
  location:'',
  description: '',
});

const error = ref(null);

const fetchStore = async () => {
  try {
    const fetchedStore = storeStore.StoreById(storeId.value);
    if (fetchedStore) {
      form.value = { ...fetchedStore }; // Populate the form with existing user data
    } else {
      error.value = 'Store not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Store';
  }
};

// Watch for changes in storeId prop to refetch user data
watch(() => props.store_id, (newstoreId) => {
  storeId.value = newstoreId;
  fetchStore();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    await storeStore.updateStore(storeId.value, form.value);


    if (storeStore.error) {
      error.value = storeStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Store';
  }
};

// Initial fetch on mount
onMounted(fetchStore);
</script>
