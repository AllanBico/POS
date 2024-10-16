<template>
  <div class="category-edit-modal">
    <h3 style="margin-top: 0">Edit Unit</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="updateUnit">
      <a-form-item label="Unit Name" :rules="[{ required: true, message: 'Please input your name!' }]">
        <a-input v-model:value="form.name" placeholder="Enter unit name" />
      </a-form-item>
      <a-form-item label="Abbreviation" :rules="[{ required: true, message: 'Please input your abbreviation!' }]">
        <a-input v-model:value="form.abbreviation" placeholder="Enter unit abbreviation" />
      </a-form-item>
      <a-form-item label="Description" :rules="[{ required: true, message: 'Please input your description!' }]">
        <a-textarea :rows="4" v-model:value="form.description" placeholder="Enter unit description" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="loading" html-type="submit" block size="large">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import {useUnitStore} from '~/stores/product/UnitStore.js';
const UnitStore = useUnitStore();
const emit = defineEmits(['submit-success']);
const props = defineProps({
  unit_id: {
    type: Number,
    required: true,
  },
});
const UnitId = ref(props.unit_id); // Make UnitId reactive
const form = ref({
  name: '',
  description: '',
  abbreviation:'',
});

const error = ref(null);
const loading = ref(false);

const fetchUnit = async () => {
  try {
    loading.value = true;
    const fetchedUnit = UnitStore.UnitById(UnitId.value);
    if (fetchedUnit) {
      form.value = { ...fetchedUnit }; // Populate the form with existing user data
    } else {
      error.value = 'Unit not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Unit';
  } finally {
    loading.value = false;
  }
};

// Watch for changes in UnitId prop to refetch user data
watch(() => props.unit_id, (newUnitId) => {
  UnitId.value = newUnitId;
  fetchUnit();
}, { immediate: true });

const updateUnit = async () => {
  try {
    loading.value = true;
    await UnitStore.updateUnit(UnitId.value, form.value);

    if (UnitStore.error) {
      error.value = UnitStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update user';
  } finally {
    loading.value = false;
  }
};

// Initial fetch on mount
onMounted(fetchUnit);
</script>
