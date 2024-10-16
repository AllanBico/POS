<template>
  <div class="payment-method-add-modal">
    <h3 style="margin-top: 0">Create Payment Method</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
      <a-form-item
        label="Payment Method Name"
        :rules="[{ required: true, message: 'Please input your name!' }]"
      >
        <a-input v-model:value="form.name" placeholder="Enter payment method name" />
      </a-form-item>
      <a-form-item
        label="Description"
        :rules="[{ required: true, message: 'Please input your description!' }]"
      >
        <a-textarea :rows="4" v-model:value="form.description" placeholder="Enter payment method description" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="paymentMethodStore.loading" html-type="submit" block size="large">
          <template #icon><PlusOutlined /></template>
          Add Payment Method
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { usePaymentMethodStore } from '~/stores/PaymentMethodStore.js';
import { PlusOutlined } from '@ant-design/icons-vue';

const paymentMethodStore = usePaymentMethodStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp()
// const loading = ref(false); // Removed, using paymentMethodStore.loading instead
const form = ref({
  name: '',
  description: '',
});


const handleSubmit = async () => {
  try {
    // Validate that all fields are filled
    if (!form.value.name || !form.value.description ) {
      throw new Error('All fields are required.');
    }
    // loading.value = true; // Removed, using paymentMethodStore.loading instead

    // Call the store method to add the user
    await paymentMethodStore.createPaymentMethod({
      name: form.value.name,
      description: form.value.description
    });

    // Reset form
    form.value = { name: '', description: '' };
    // Emit event to close the modal if needed
    emit('submit-success');
    // loading.value = false; // Removed, using paymentMethodStore.loading instead
  } catch (error) {
    // loading.value = false; // Removed, using paymentMethodStore.loading instead
    console.error('Error adding Payment:', error);
    $toast.error(error.message || 'Error Creating Payment')
    // Optionally, show an error message to the user
  }
};
</script>


<style scoped>
/* Add any custom styles if needed */
</style>
