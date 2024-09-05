<template>
  <a-form :form="form" @submit.prevent="handleSubmit">
    <a-form-item
        label="Name"
        :rules="[{ required: true, message: 'Please input your name!' }]"
    >
      <a-input v-model:value="form.name" />
    </a-form-item>
    <a-form-item
        label="Email"
        :rules="[{ required: true, message: 'Please input your email!' }]"
    >
      <a-input v-model:value="form.email" />
    </a-form-item>
    <a-form-item
        label="Phone"
        :rules="[{ required: true, message: 'Please input your phone number!' }]"
    >
      <a-input v-model:value="form.phone" />
    </a-form-item>
    <a-form-item label="Address">
      <a-input v-model:value="form.address" />
    </a-form-item>
    <a-form-item label="City">
      <a-input v-model:value="form.city" />
    </a-form-item>
    <a-form-item label="Country">
      <a-select
          v-model:value="form.country"
          placeholder="Select a country"
          show-search
          :filter-option="filterOption"
          @change="onCountryChange"
          :options="countries.map((country) => ({ value: country, label: country }))"
      />
    </a-form-item>
    <a-form-item label="Description">
      <a-textarea :rows="4" v-model:value="form.description" />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="loading">
        Submit
      </a-button>
    </a-form-item>
  </a-form>
</template>


<script setup>
import { ref } from 'vue';
import { useCustomerStore } from '~/stores/customer.js';
import { getNames } from 'country-list';

const customerStore = useCustomerStore();
const emit = defineEmits(['submit-success']);
const countries = ref(getNames());
const loading = ref(false);
const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  description: '',
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    await customerStore.createCustomer(form.value);
    form.value = {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      description: '',
    };
    emit('submit-success');
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error('Error creating customer:', error);
  }
};

// Custom filter option to filter the country list
const filterOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

// Reset the form.country if the input value is not a valid country
const onCountryChange = (value) => {
  if (!countries.value.includes(value)) {
    form.value.country = '';
  }
};
</script>


<style scoped>
/* Add any custom styles if needed */
</style>
