<template>
  <a-form :form="form" @submit.prevent="updatePayment">
    <a-form-item label="name" :rules="[{ required: true, message: 'Please input payment name!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>
    <a-form-item label="Description" :rules="[{ required: true, message: 'Please input payment description!' }]">
      <a-textarea :rows="4" v-model:value="form.description"/>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>
<script setup>
import {ref, onMounted, watch} from 'vue';
import { usePaymentMethodStore } from '@/stores/PaymentMethod.js';

const paymentMethodStore = usePaymentMethodStore();
const emit = defineEmits(['submit-success']);
const props = defineProps({
  payment_id: {
    type: Number,
    required: true,
  },
});
const paymentId = ref(props.payment_id); // Make paymentId reactive
const form = ref({
  name: '',
  description: '',
});

const error = ref(null);

const fetchPayment = async () => {
  try {
    const fetchedPayment = paymentMethodStore.PaymentMethodById(paymentId.value);
    if (fetchedPayment) {
      form.value = {...fetchedPayment}; // Populate the form with existing user data
    } else {
      error.value = 'Payment Method not found';
    }
  } catch (err) {
    error.value = err.message || 'Failed to load Payment Method';
  }
};

// Watch for changes in paymentId prop to refetch user data
watch(() => props.payment_id, (newpaymentId) => {
  paymentId.value = newpaymentId;
  fetchPayment();
}, {immediate: true});

const updatePayment = async () => {
  try {
    await paymentMethodStore.updatePaymentMethod(paymentId.value, form.value);


    if (paymentMethodStore.error) {
      error.value = paymentMethodStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Payment Method';
  }
};

// Initial fetch on mount
onMounted(fetchPayment);
</script>
