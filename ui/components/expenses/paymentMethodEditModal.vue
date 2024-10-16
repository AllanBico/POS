<template>
  <div class="payment-method-edit-modal">
    <h3 style="margin-top: 0">Edit Payment Method</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="updatePayment">
      <a-form-item label="Payment Method Name" :rules="[{ required: true, message: 'Please input your name!' }]">
        <a-input v-model:value="form.name" placeholder="Enter payment method name" />
      </a-form-item>
      <a-form-item label="Description" :rules="[{ required: true, message: 'Please input your description!' }]">
        <a-textarea :rows="4" v-model:value="form.description" placeholder="Enter payment method description" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="paymentMethodStore.loading" html-type="submit" block size="large">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup>
import {ref, onMounted, watch} from 'vue';
import { usePaymentMethodStore } from '~/stores/PaymentMethodStore.js';

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
    paymentMethodStore.setLoading(true);
    await paymentMethodStore.updatePaymentMethod(paymentId.value, form.value);


    if (paymentMethodStore.error) {
      error.value = paymentMethodStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update Payment Method';
  } finally {
    paymentMethodStore.setLoading(false);
  }
};

// Initial fetch on mount
onMounted(fetchPayment);
</script>
