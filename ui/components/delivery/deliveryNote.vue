<template>
  <div class="delivery-note">
    <!-- Header -->
    <a-row>
      {{deliveryData}}
      <a-col :span="12">
        <h2>{{ deliveryData?.createdByName }}</h2>
        <p>{{ deliveryData?.deliveryAddress }}</p>
      </a-col>
      <a-col :span="12" class="text-right">
        <h2>DELIVERY NOTE</h2>
      </a-col>
    </a-row>

    <a-divider />

    <!-- Delivery and Shipping Information -->
    <a-row>
      <a-col :span="12">
        <h3>Deliver To</h3>
        <p>{{ deliveryData?.deliveryPerson }}</p>
      </a-col>
      <a-col :span="12">
        <h3>Ship To</h3>
        <p>{{ deliveryData?.shipToAddress }}</p>
      </a-col>
    </a-row>

    <a-row>
      <a-col :span="8">
        <p><strong>Delivery #</strong>: {{ deliveryData?.id }}</p>
      </a-col>
      <a-col :span="8">
        <p><strong>Delivery Date</strong>: {{ formatDate(deliveryData?.deliveryDate) }}</p>
      </a-col>
      <a-col :span="8">
        <p><strong>P.O.#</strong>: {{ deliveryData?.poNumber }}</p>
      </a-col>
    </a-row>

    <a-row>
      <a-col :span="12">
        <p><strong>Due Date</strong>: {{ formatDate(deliveryData?.dueDate) }}</p>
      </a-col>
    </a-row>

    <a-divider />

    <!-- Table of Items -->
    <a-table :columns="columns" :dataSource="lineItems" bordered pagination="false" />

    <!-- Total Section -->
    <a-row class="total-section" justify="end">
      <a-col :span="6">
        <p><strong>Subtotal:</strong> {{ totalAmount }}</p>
        <p><strong>Sales tax 5.0%:</strong> {{ salesTax }}</p>
        <p><strong>Total:</strong> <span class="total-amount">{{ totalWithTax }}</span></p>
      </a-col>
    </a-row>

    <!-- Footer -->
    <a-divider />

    <a-row>
      <a-col :span="12">
        <p><strong>Terms & Conditions</strong></p>
        <p>Payment is due within 15 days</p>
      </a-col>
    </a-row>

    <a-row>
      <a-col :span="12">
        <p>Name of Bank</p>
        <p>Account number: {{ deliveryData?.bankAccount }}</p>
        <p>Routing: {{ deliveryData?.routingNumber }}</p>
      </a-col>
    </a-row>

    <!-- Signature -->
    <a-row justify="end">
      <a-col :span="12" class="text-right">
        <p><strong>{{ deliveryData?.createdByName }}</strong></p>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import { useDeliveryStore } from '~/stores/delivery/DeliveryStore.js';

const deliveryStore = useDeliveryStore();
const deliveryData = ref(null);
const fetchDelivery = async () => {
  try {
    deliveryData.value = await deliveryStore.getDeliveryById(parseInt(props.delivery_id));
    const lineItems = computed(() => {
      return deliveryData.value.DeliveryLineItems.map(item => ({
        key: item.id,
        quantity: item.quantity,
        description: item.description,
        unitPrice: `$${item.unitPrice.toFixed(2)}`,
        amount: `$${(item.unitPrice * item.quantity).toFixed(2)}`,
      }));
    });
  } catch (error) {
    console.error('Error Fetching Delivery:', error);
    $toast.error(error.message || 'Failed to load Delivery');
  }
};
const props = defineProps({
  delivery_id: {
    type: Number,
    required: true,
  },
});
fetchDelivery()
const deliveryId = ref(props.delivery_id);

const columns = [
  { title: 'QTY', dataIndex: 'quantity', key: 'quantity' },
  { title: 'DESCRIPTION', dataIndex: 'description', key: 'description' },
  { title: 'UNIT PRICE', dataIndex: 'unitPrice', key: 'unitPrice' },
  { title: 'AMOUNT', dataIndex: 'amount', key: 'amount' },
];



const totalAmount = computed(() => {
  return 100;
});

const salesTax = computed(() => {
  return 100;
});

const totalWithTax = computed(() => {
  return 100;
});

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : 'N/A';
};
</script>

<style scoped>
.delivery-note {
  font-family: Arial, sans-serif;
  font-size: 14px;
  margin: 0 auto;
  max-width: 800px;
  padding: 20px;
  border: 1px solid #ccc;
}

.text-right {
  text-align: right;
}

.total-section p {
  margin: 0;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
}
</style>
