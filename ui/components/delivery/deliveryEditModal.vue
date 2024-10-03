<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDeliveryStore } from '~/stores/delivery/DeliveryStore.js';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js';
import { useCustomerStore } from '~/stores/CustomerStore.js';
import { useProductStore } from "~/stores/product/ProductStore.js";
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons-vue';

const productStore = useProductStore();
const deliveryStore = useDeliveryStore();
const salesOrderStore = useSalesOrderStore();
const customerStore = useCustomerStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();
const loading = ref(false);

const props = defineProps({
  delivery_id: {
    type: Number,
    required: true,
  },
});

const deliveryId = ref(props.delivery_id);

productStore.fetchVariants();
productStore.fetchProducts();
salesOrderStore.fetchOrders();
customerStore.fetchCustomers();

const products = computed(() => productStore.variants || []);
const customers = computed(() => customerStore.customers || []);
const salesOrders = computed(() => salesOrderStore.orders || []);

const customerOptions = computed(() =>
  customers.value.map(customer => ({
    value: customer.id,
    label: customer.name
  }))
);

const productOptions = computed(() =>
  products.value.map(variant => ({
    value: variant.id,
    label: `${variant.sku} (${variant.Product?.name || 'Unknown Product'})`
  }))
);

const salesOrderOptions = computed(() =>
  salesOrders.value.map(order => ({
    value: order.id,
    label: `Order #${order.id} - ${order.customer?.name || 'Unknown Customer'}`
  }))
);

const initDeliveryData = () => ({
  salesOrderId: null,
  customerId: null,
  deliveryAddress: '',
  deliveryPerson: '',
  deliveryDate: null,
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

const fetchDelivery = async () => {
  try {
    loading.value = true;
    const fetchedDelivery = await deliveryStore.getDeliveryById(deliveryId.value);
    console.log("fetchedDelivery", fetchedDelivery);
    if (fetchedDelivery) {
      deliveryData.value = {
        ...fetchedDelivery,
        lineItems: fetchedDelivery.DeliveryLineItems.map(item => ({
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          description: item.description,
        })),
      };
    } else {
      throw new Error('Delivery not found');
    }
  } catch (error) {
    console.error('Error Fetching Delivery:', error);
    $toast.error(error.message || 'Failed to load Delivery');
  } finally {
    loading.value = false;
  }
};

watch(() => props.delivery_id, (newDeliveryId) => {
  deliveryId.value = newDeliveryId;
  fetchDelivery();
}, { immediate: true });

const handleSubmit = async () => {
  try {
    loading.value = true;
    const result = await deliveryStore.updateDelivery(deliveryId.value, deliveryData.value);
    console.log('Delivery updated successfully:', result);
    emit('submit-success');
    $toast.success('Delivery updated successfully!');
  } catch (error) {
    console.error('Error updating delivery:', error);
    $toast.error(error.message || 'Error Updating Delivery');
  } finally {
    loading.value = false;
  }
};

const filterOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

onMounted(fetchDelivery);
</script>

<template>
  <div class="delivery-edit-container">
    <h3>Update Delivery</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
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

      <a-form-item label="Delivery Date">
        <a-date-picker v-model:value="deliveryData.deliveryDate" style="width: 100%"  value-format="YYYY-MM-DD" />
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
        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
          block
          size="large"
        >
          <template #icon><EditOutlined /></template>
          Update Delivery
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped>
.delivery-edit-container {
  margin: 0 auto;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-table-wrapper) {
  margin-bottom: 16px;
}
</style>