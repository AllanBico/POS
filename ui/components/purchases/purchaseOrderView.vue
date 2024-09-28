<template>
  <div class="purchase-order-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Purchase Order Details"
        :sub-title="`Order #${purchaseOrder.id}`"
      >
        <template #extra>
          <a-button type="primary" @click="receiveGoods(purchaseOrder.id)">
            Receive Goods
          </a-button>
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
      <a-card class="info-card" :bordered="false">
        <a-descriptions bordered>
          <a-descriptions-item v-if="purchaseOrder.supplier" label="Supplier">
            {{ purchaseOrder.supplier.name }}
          </a-descriptions-item>
          <a-descriptions-item v-if="purchaseOrder.warehouse" label="Warehouse">
            {{ purchaseOrder.warehouse.name }}
          </a-descriptions-item>
          <a-descriptions-item v-if="purchaseOrder.store" label="Store">
            {{ purchaseOrder.store.name }}
          </a-descriptions-item>
          <a-descriptions-item label="Order Date">
            {{ formatDate(purchaseOrder.orderDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="Expected Delivery Date">
            {{ formatDate(purchaseOrder.expectedDeliveryDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="Status">
            <a-tag :color="getStatusColor(purchaseOrder.status)">
              {{ purchaseOrder.status.toUpperCase() }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card class="table-card" :bordered="false">
        <a-table
          :columns="columns"
          :dataSource="purchaseOrder.lineItems"
          :pagination="false"
          rowKey="id"
          :bordered="true"
          class="line-items-table"
        >
          <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'receivedQuantity'">
              {{ record.receivedQuantity }}
          </template>
          </template>
          <template #footer>
            <div class="table-footer">
              <strong>Total Amount:</strong>
              <span class="total-amount">{{ totalAmount }}</span>
            </div>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePurchaseOrderStore } from '~/stores/purchases/PurchaseOrderStore.js';
import GoodsReceivingForm from "~/components/inventory/receive/GoodsReceivingAdd.vue";
import { useTabsStore } from "~/stores/tabsStore.js";
import {
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons-vue";
const { initDateFormat, formatDate } = useDateFormatter();
const tabsStore = useTabsStore();

const props = defineProps({
  purchaseOrderId: {
    type: Number,
    required: true,
  },
});

const purchaseOrderStore = usePurchaseOrderStore();

const purchaseOrder = computed(() => purchaseOrderStore.purchaseOrderById(parseInt(props.purchaseOrderId)));
console.log("props",props.purchaseOrderId)
console.log("purchaseOrder",purchaseOrder)

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
  },{
    title: 'Received Quantity',
    dataIndex: 'receivedQuantity',
    key: 'receivedQuantity',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    customRender: ({ text }) => `$${parseFloat(text).toFixed(2)}`,
  },
  {
    title: 'Subtotal',
    key: 'subtotal',
    customRender: ({ record }) => `$${(record.quantity * record.price).toFixed(2)}`,
  },
];

const totalAmount = computed(() => {
  const total = purchaseOrder.value.lineItems?.reduce((total, item) => total + item.quantity * item.price, 0);
  return `$${total.toFixed(2)}`;
});



const receiveGoods = async key => {
  tabsStore.addTab('Receive Goods', GoodsReceivingForm, { purchaseOrderId: key });
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    completed: 'green',
    cancelled: 'red',
  };
  return colors[status.toLowerCase()] || 'blue';
};

const exportToExcel = () => {
  // Implement Excel export logic
};

const exportToPDF = () => {
  // Implement PDF export logic
};
</script>

<style scoped>
.purchase-order-container {
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

.info-card, .table-card {
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
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  font-size: 16px;
}

.total-amount {
  margin-left: 8px;
  font-weight: bold;
  font-size: 18px;
  color: #1890ff;
}

.export-btn {
  margin-left: 8px;
}
</style>
