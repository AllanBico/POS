<template>
  <div class="delivery-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Delivery Details"
        :sub-title="`Delivery #${deliveryData?.id}`"
      >
        <template #extra>
          <a-button @click="deliverNote">view</a-button>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="exportToExcel">
                  <FileExcelOutlined /> Excel
                </a-menu-item>
                <a-menu-item key="2" @click="exportToPDF">
                  <FilePdfOutlined /> PDF
                </a-menu-item>
              </a-menu>
            </template>
            <a-button class="export-btn">
              Export <DownOutlined />
            </a-button>
          </a-dropdown>
        </template>
      </a-page-header>
    </a-card>

    <div class="content-container">
      <a-spin :spinning="loading">
        <template v-if="deliveryData">
          <a-card class="info-card" :bordered="false">
            <a-descriptions bordered>
              <a-descriptions-item label="Customer">{{ customerName }}</a-descriptions-item>
              <a-descriptions-item label="Sales Order">{{ salesOrderNumber }}</a-descriptions-item>
              <a-descriptions-item label="Delivery Address">{{ deliveryData.deliveryAddress }}</a-descriptions-item>
              <a-descriptions-item label="Delivery Person">{{ deliveryData.deliveryPerson }}</a-descriptions-item>
              <a-descriptions-item label="Delivery Date">{{ formatDate(deliveryData.deliveryDate) }}</a-descriptions-item>
              <a-descriptions-item label="Status">
                <a-tag :color="getStatusColor(deliveryData.status)">
                  {{ deliveryData.status.toUpperCase() }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card class="table-card" :bordered="false">
            <a-table
              :columns="columns"
              :dataSource="lineItems"
              :pagination="false"
              rowKey="key"
              :bordered="true"
              class="line-items-table"
            >
              <template #footer>
                <div class="table-footer">
                  <strong>Notes:</strong>
                  <span class="notes">{{ deliveryData.notes || 'No notes' }}</span>
                </div>
              </template>
            </a-table>
          </a-card>
        </template>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDeliveryStore } from '~/stores/delivery/DeliveryStore.js';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js';
import { useCustomerStore } from '~/stores/CustomerStore.js';
import { useProductStore } from "~/stores/product/ProductStore.js";
import {
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons-vue";
import {useTabsStore} from "~/stores/tabsStore.js";
import deliveryNote from "~/components/delivery/deliveryNote.vue";

const deliveryStore = useDeliveryStore();
const salesOrderStore = useSalesOrderStore();
const customerStore = useCustomerStore();
const productStore = useProductStore();
const { $toast } = useNuxtApp();
const loading = ref(false);

const props = defineProps({
  delivery_id: {
    type: Number,
    required: true,
  },
});
const tabsStore = useTabsStore();
const deliveryId = ref(props.delivery_id);
const deliveryData = ref(null);
const deliverNote = () => {
  tabsStore.addTab('delivery note',deliveryNote ,{
    delivery_id: props.delivery_id})
}
const fetchDelivery = async () => {
  try {
    loading.value = true;
    const fetchedDelivery = await deliveryStore.getDeliveryById(parseInt(props.delivery_id));
    console.log("fetchedDelivery",fetchedDelivery)
    if (fetchedDelivery) {
      deliveryData.value = fetchedDelivery;
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

const customerName = computed(() => {
  const customer = customerStore.customers.find(c => c.id === deliveryData.value?.customerId);
  return customer ? customer.name : 'Unknown Customer';
});

const salesOrderNumber = computed(() => {
  const order = salesOrderStore.orders.find(o => o.id === deliveryData.value?.salesOrderId);
  return order ? `Order #${order.id}` : 'N/A';
});

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : 'N/A';
};

const columns = [
  { title: 'Product', dataIndex: 'product', key: 'product' },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
  { title: 'Description', dataIndex: 'description', key: 'description' },
];

const lineItems = computed(() => {
  return deliveryData.value?.DeliveryLineItems.map(item => ({
    key: item.id,
    product: item?.Variant?.sku || 'Unknown Product',
    quantity: item.quantity,
    description: item.description,
  })) || [];
});

const getStatusColor = (status) => {
  const colors = {
    'Delivered': 'green',
    'In Transit': 'blue',
    'Pending': 'orange',
  };
  return colors[status] || 'blue';
};

const exportToExcel = () => {
  // Implement Excel export logic
};

const exportToPDF = () => {
  // Implement PDF export logic
};

onMounted(() => {
  productStore.fetchVariants();
  salesOrderStore.fetchOrders();
  customerStore.fetchCustomers();
  fetchDelivery();
});
</script>

<style scoped>
.delivery-container {
  background-color: #f0f2f5;
  padding: 24px;
  border-radius: 8px;
}

.header-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header {
  padding: 16px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
 .table-card {
  margin-top: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.line-items-table {
  margin-top: 16px;
}

:deep(.ant-table) {
  font-size: 14px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  color: #001529;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}

.table-footer {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
  font-size: 16px;
}

.notes {
  margin-left: 8px;
  font-style: italic;
}

.export-btn {
  margin-left: 8px;
}
</style>