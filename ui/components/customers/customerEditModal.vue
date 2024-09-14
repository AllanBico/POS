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
      <!-- Updated a-select component for autocomplete functionality -->
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
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCustomerStore } from '~/stores/CustomerStore.js';
import { getNames } from 'country-list';

// Set up customer store and country list
const customerStore = useCustomerStore();
const countries = ref(getNames());
const emit = defineEmits(['submit-success']);
const props = defineProps({
  customer_id: {
    type: Number,
    required: true,
  },
});

// Reactive property for customer ID
const customerId = ref(props.customer_id);
const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  description: '',
});
const error = ref(null);

// Function to fetch customer data by ID
const fetchCustomer = async () => {
  try {
    const fetchedCustomer = await customerStore.CustomerById(customerId.value);
    if (fetchedCustomer) {
      form.value = { ...fetchedCustomer };
    } else {
      error.value = 'Customer not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Customer';
  }
};

// Watch for changes in customerId prop to refetch user data
watch(
    () => props.customer_id,
    (newCustomerId) => {
      customerId.value = newCustomerId;
      fetchCustomer();
    },
    { immediate: true }
);

// Function to handle form submission
const handleSubmit = async () => {
  try {
    await customerStore.updateCustomer(customerId.value, form.value);
    if (customerStore.error) {
      error.value = customerStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Customer';
  }
};

// Custom filter option to filter the country list for autocomplete
const filterOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

// Reset the form.country if the input value is not a valid country
const onCountryChange = (value) => {
  if (!countries.value.includes(value)) {
    form.value.country = '';
  }
};

// Initial fetch on mount
onMounted(fetchCustomer);
</script>

