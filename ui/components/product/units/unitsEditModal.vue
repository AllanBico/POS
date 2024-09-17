
<template>
  <a-form :form="form" @submit.prevent="updateUnit">
    <a-form-item label="name" :rules="[{ required: true, message: 'Please input your name!' }]">
      <a-input  v-model:value="form.name" />
    </a-form-item>
    <a-form-item label="abbreviation" :rules="[{ required: true, message: 'Please input your abbreviation!' }]">
      <a-input  v-model:value="form.abbreviation" />
    </a-form-item>
    <a-form-item label="Description" :rules="[{ required: true, message: 'Please input your description!' }]">
      <a-textarea :rows="4" v-model:value="form.description" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import {useUnitStore} from '~/stores/UnitStore.js';
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

const fetchUnit = async () => {
  try {
    const fetchedUnit = UnitStore.UnitById(UnitId.value);
    if (fetchedUnit) {
      form.value = { ...fetchedUnit }; // Populate the form with existing user data
    } else {
      error.value = 'Unit not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Unit';
  }
};

// Watch for changes in UnitId prop to refetch user data
watch(() => props.unit_id, (newUnitId) => {
  UnitId.value = newUnitId;
  fetchUnit();
}, { immediate: true });

const updateUnit = async () => {
  try {
    await UnitStore.updateUnit(UnitId.value, form.value);


    if (UnitStore.error) {
      error.value = UnitStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update user';
  }
};

// Initial fetch on mount
onMounted(fetchUnit);
</script>
