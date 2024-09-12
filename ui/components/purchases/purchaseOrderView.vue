<template>
  <a-card title="Purchase Order Details" bordered>
    <!-- Basic Purchase Order Information -->
    <a-descriptions  bordered>
      <a-descriptions-item label="Supplier">
        {{ purchaseOrder.supplier.name }}
      </a-descriptions-item>
      <a-descriptions-item label="Warehouse">
        {{ purchaseOrder.warehouse.name }}
      </a-descriptions-item>
      <a-descriptions-item label="Store">
        {{ purchaseOrder.store.name }}
      </a-descriptions-item>
      <a-descriptions-item label="Order Date">
        {{ formatDate(purchaseOrder.orderDate) }}
      </a-descriptions-item>
      <a-descriptions-item label="Expected Delivery Date">
        {{ formatDate(purchaseOrder.expectedDeliveryDate) }}
      </a-descriptions-item>
    </a-descriptions>

    <!-- Line Items Table -->
    <a-table
        :columns="columns"
        :dataSource="purchaseOrder.lineItems"
        :pagination="false"
        rowKey="id"
        bordered
        class="line-items-table"
    />

    <!-- Total Amount -->
    <div class="total-amount">
      <strong>Total Amount: </strong> {{ totalAmount }}
    </div>
    <div>
      <a-button type="primary" @click="receiveGoods(purchaseOrder.id)">Receive Goods</a-button>
    </div>
  </a-card>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import { usePurchaseOrderStore } from '@/stores/purchaseOrder.js';
import GoodsReceivingForm from "~/components/inventory/receive/GoodsReceivingAdd.vue";
import {useTabsStore} from "~/stores/tabsStore.js";
const tabsStore = useTabsStore();
// Get purchaseOrderId as a prop
const props = defineProps({
  purchaseOrderId: {
    type: Number,
    required: true,
  },
});
console.log("props.purchaseOrderId",props.purchaseOrderId)
// Initialize purchaseOrder store
const purchaseOrderStore = usePurchaseOrderStore();

// Local state to store purchase order data
const purchaseOrder = computed(() => purchaseOrderStore.purchaseOrderById(parseInt(props.purchaseOrderId)));

// Columns for the line items table
const columns = [
  {
    title: 'Product (Variant)',
    dataIndex: 'variant',
    key: 'variant',
    customRender: ({ record }) => `${record.variant.Product.name} (${record.variant.sku})`,
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Subtotal',
    key: 'subtotal',
    customRender: ({ record }) => (record.quantity * record.price).toFixed(2),
  },
];

// Fetch and set purchase order details when component is mounted



// Compute total amount for the purchase order
const totalAmount = computed(() => {
  return purchaseOrder.value.lineItems?.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2);
});

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
const receiveGoods = async key => {
  tabsStore.addTab('Receive Goods', GoodsReceivingForm, { purchaseOrderId: key });
};
</script>

<style scoped>
.line-items-table {
  margin-top: 16px;
}

.total-amount {
  margin-top: 16px;
  font-size: 16px;
}
</style>
