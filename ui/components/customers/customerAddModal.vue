<template>
  <div class="customer-add-modal">
    <h3>Create Customer</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form :model="form" @submit.prevent="handleSubmit" layout="vertical">
      <a-form-item
        name="name"
        label="Customer Name"
        :rules="[{ required: true, message: 'Please input the customer name!' }]"
      >
        <a-input
          v-model:value="form.name"
          placeholder="Enter customer name"
          :maxLength="50"
        >
        </a-input>
      </a-form-item>

      <a-form-item
        name="email"
        label="Email"
        :rules="[
          { required: true, message: 'Please input the customer email!' },
          { type: 'email', message: 'Please enter a valid email!' }
        ]"
      >
        <a-input
          v-model:value="form.email"
          placeholder="Enter customer email"
          :maxLength="100"
        >
        </a-input>
      </a-form-item>

      <a-form-item
        name="phone"
        label="Phone"
        :rules="[{ required: true, message: 'Please input the customer phone number!' }]"
      >
        <a-input
          v-model:value="form.phone"
          placeholder="Enter customer phone"
          :maxLength="20"
        >
        </a-input>
      </a-form-item>

      <a-form-item name="address" label="Address">
        <a-input
          v-model:value="form.address"
          placeholder="Enter customer address"
          :maxLength="200"
        >
        </a-input>
      </a-form-item>

      <a-form-item name="city" label="City">
        <a-input
          v-model:value="form.city"
          placeholder="Enter customer city"
          :maxLength="100"
        >
        </a-input>
      </a-form-item>

      <a-form-item name="country" label="Country">
        <a-select
          v-model:value="form.country"
          placeholder="Select a country"
          show-search
          :filter-option="filterOption"
          @change="onCountryChange"
          :options="countries.map((country) => ({ value: country, label: country }))"
        >
        </a-select>
      </a-form-item>

      <a-form-item name="description" label="Description">
        <a-textarea
          v-model:value="form.description"
          :rows="4"
          placeholder="Enter customer description"
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
          Add Customer
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCustomerStore } from '~/stores/CustomerStore.js';
import { getNames } from 'country-list';
import { PlusOutlined } from '@ant-design/icons-vue';

const customerStore = useCustomerStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();
const loading = ref(false);
const countries = ref(getNames());
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
  try {
    if (!form.value.name || !form.value.email || !form.value.phone) {
      throw new Error('Customer name, email, and phone are required.');
    }
    loading.value = true;

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
    $toast.success('Customer added successfully!');
  } catch (error) {
    console.error('Error Adding Customer:', error);
    $toast.error(error.message || 'Error Creating Customer');
  } finally {
    loading.value = false;
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
</style>
