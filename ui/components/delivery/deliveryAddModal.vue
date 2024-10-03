<script setup>
import { ref, computed } from 'vue';
import { useDeliveryStore } from '~/stores/delivery/DeliveryStore.js';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js';
import { useCustomerStore } from '~/stores/CustomerStore.js';
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import {useProductStore} from "~/stores/product/ProductStore.js";
const productStore = useProductStore();
productStore.fetchVariants();
const products = computed(() => productStore.variants);
const deliveryStore = useDeliveryStore();
const salesOrderStore = useSalesOrderStore();
const customerStore = useCustomerStore();
const emit = defineEmits(['submit-success']);
salesOrderStore.fetchOrders();
customerStore.fetchCustomers();

const customers = computed(() => customerStore.customers);
const salesOrders = computed(() => salesOrderStore.orders);

const customerOptions = computed(() =>
  customers.value.map(customer => ({
    value: customer.id,
    label: customer.name
  }))
);
const productOptions = computed(() =>
    products.value.map(variant => ({
      value: variant.id,
      label: `${variant.sku} (${variant.Product.name})`
    }))
);
const salesOrderOptions = computed(() =>
  salesOrders.value.map(order => ({
    value: order.id,
    label: `Order #${order.id} - ${order.customer.name}`
  }))
);

const initDeliveryData = () => ({
  salesOrderId: null,
  customerId: null,
  deliveryAddress: '',
  deliveryPerson: '',
  status: 'Pending',
  notes: '',
  lineItems: [],
});

const deliveryData = ref(initDeliveryData());

const columns = [
  { title: 'Product', dataIndex: 'variantId', key: 'variantId' },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
  { title: 'Description', dataIndex: 'description', key: 'description' },
  { title: 'Action', dataIndex: 'action', key: 'action' },
];

const addLineItem = () => {
  deliveryData.value.lineItems.push({
    id: Date.now(),
    variantId: null,
    quantity: 1,
    description: '',
  });
};

const removeLineItem = (id) => {
  deliveryData.value.lineItems = deliveryData.value.lineItems.filter(item => item.id !== id);
};

const handleSubmit = async () => {
  try {
    const result = await deliveryStore.createDelivery(deliveryData.value);
    console.log('Delivery created successfully:', result);
    deliveryData.value = initDeliveryData();
    // Emit event to parent component to close modal and refresh table
    emit('submit-success');
  } catch (error) {
    console.error('Error creating delivery:', error);
  }
};

const filterOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
</script>

<template>
  <div class="delivery-add-container">
    <a-form layout="vertical" @submit.prevent="handleSubmit">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="Sales Order">
            <a-select
              v-model:value="deliveryData.salesOrderId"
              placeholder="Select Sales Order"
              :options="salesOrderOptions"
              :filter-option="filterOption"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Customer">
            <a-select
              v-model:value="deliveryData.customerId"
              placeholder="Select Customer"
              :options="customerOptions"
              :filter-option="filterOption"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Delivery Address">
        <a-input v-model:value="deliveryData.deliveryAddress" />
      </a-form-item>

      <a-form-item label="Delivery Person">
        <a-input v-model:value="deliveryData.deliveryPerson" />
      </a-form-item>

      <a-form-item label="Status">
        <a-select v-model:value="deliveryData.status">
          <a-select-option value="Pending">Pending</a-select-option>
          <a-select-option value="In Transit">In Transit</a-select-option>
          <a-select-option value="Delivered">Delivered</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Notes">
        <a-textarea v-model:value="deliveryData.notes" />
      </a-form-item>

      <a-divider>Delivery Items</a-divider>

      <a-button type="dashed" style="width: 100%; margin-bottom: 8px" @click="addLineItem">
        <PlusOutlined /> Add Item
      </a-button>

      <a-table :dataSource="deliveryData.lineItems" :columns="columns" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'variantId'">
            <a-select
              v-model:value="record.variantId"
              placeholder="Select Product"
              style="width: 100%;"
              :options="productOptions"
            >
              <!-- Add product options here -->
            </a-select>
          </template>

          <template v-else-if="column.dataIndex === 'quantity'">
            <a-input-number v-model:value="record.quantity" :min="1" style="width: 100%" />
          </template>

          <template v-else-if="column.dataIndex === 'description'">
            <a-input v-model:value="record.description" />
          </template>

          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" danger @click="removeLineItem(record.id)">
              <DeleteOutlined />
            </a-button>
          </template>
        </template>
      </a-table>

      <a-form-item>
        <a-button type="primary" html-type="submit" :icon="h(SaveOutlined)">
          Create Delivery
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped>
.delivery-add-container {
  margin: 0 auto;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-table-wrapper) {
  margin-bottom: 16px;
}
</style>