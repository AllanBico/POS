<template>
  <div class="units-add-modal">
    <h3 style="margin-top: 0">Add Unit</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
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
const form = ref({
  name: '',
  description: '',
  abbreviation:'',
});
const loading = ref(false);
const error = ref(null);

const handleSubmit = async () => {
  try {
    loading.value = true;
    await UnitStore.createUnit(form.value);
    if (UnitStore.error) {
      error.value = UnitStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to add unit';
  } finally {
    loading.value = false;
  }
};

</script>
