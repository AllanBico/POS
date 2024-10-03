<template>
  <div class="order-view-container">
    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        :title="`Order #${orderDetails.id}`"
        :sub-title="orderDetails.createdAt | formatDate"
      >
        <template #tags>
          <a-tag :color="getStatusColor(orderDetails.status)">
            {{ orderDetails.status }}
          </a-tag>
        </template>
        <template #extra>
          <a-space>
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="handlePrint('invoice')">
                    <PrinterOutlined /> Print Invoice
                  </a-menu-item>
                  <a-menu-item key="2" @click="handlePrint('receipt')">
                    <PrinterOutlined /> Print Receipt
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button type="primary">
                <template #icon><PrinterOutlined /></template>
                Print <DownOutlined />
              </a-button>
            </a-dropdown>
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
              <a-button>
                Export <DownOutlined />
              </a-button>
            </a-dropdown>
          </a-space>
        </template>
      </a-page-header>
    </a-card>

    <!-- Order Summary -->
    <a-row :gutter="24">
      <a-col :span="16">
        <a-card class="summary-card" :bordered="false">
          <a-descriptions title="Order Details" :column="2" bordered>
            <a-descriptions-item label="Customer">
              {{ orderDetails?.customer ? orderDetails?.customer?.name : 'None' }}
            </a-descriptions-item>
            <a-descriptions-item label="Order Total">
              {{ settingsStore.getSettingByKey("default_currency")?.code }} {{ orderDetails.total | currency }}
            </a-descriptions-item>
            <a-descriptions-item label="Payment Method">
              {{ orderDetails.paymentMethod ? orderDetails.paymentMethod.name : 'N/A' }}
            </a-descriptions-item>
            <a-descriptions-item label="Order Date">
              {{ orderDetails.createdAt | formatDate }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="summary-card" :bordered="false">
          <a-statistic 
            title="Order Total" 
            :value="orderDetails.total" 
            :precision="2" 
            :prefix="settingsStore.getSettingByKey('default_currency')?.code"
            class="order-total-statistic"
          />
          <a-divider />
          <a-progress
            :percent="getOrderProgress(orderDetails.status)"
            :status="getOrderProgressStatus(orderDetails.status)"
            :format="percent => orderDetails.status"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- Line Items -->
    <a-card class="line-items-card" title="Line Items" :bordered="false">
      <a-table
        :dataSource="orderDetails.lineItems"
        :columns="columns"
        :pagination="false"
        :rowKey="(record, index) => index"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'product'">
            <div class="product-cell">
              <a-avatar :src="record.variant.images[0]?.url" :size="40" shape="square" />
              <div class="product-info">
                <div class="product-name">{{ record.variant.Product.name }}</div>
                <div class="product-sku">SKU: {{ record.variant.sku }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'price'">
            {{ settingsStore.getSettingByKey("default_currency")?.code }} {{ record.price | currency }}
          </template>
          <template v-else-if="column.dataIndex === 'total'">
            {{ settingsStore.getSettingByKey("default_currency")?.code }} {{ record.total | currency }}
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Coupon Information -->
    <a-card v-if="orderDetails.CouponRedemption" class="coupon-card" title="Applied Coupon" :bordered="false">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="Coupon Code">
          {{ orderDetails.CouponRedemption.Coupon.code }}
        </a-descriptions-item>
        <a-descriptions-item label="Discount Amount">
          {{ settingsStore.getSettingByKey("default_currency")?.code }} {{ orderDetails.CouponRedemption.discountAmount | currency }}
        </a-descriptions-item>
        <a-descriptions-item label="Discount Type">
          {{ orderDetails.CouponRedemption.Coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount' }}
        </a-descriptions-item>
        <a-descriptions-item label="Discount Value">
          {{ orderDetails.CouponRedemption.Coupon.discountType === 'percentage' 
            ? `${orderDetails.CouponRedemption.Coupon.discountValue}%` 
            : `${settingsStore.getSettingByKey("default_currency")?.code} ${orderDetails.CouponRedemption.Coupon.discountValue}` }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js';
import { useRoute } from 'vue-router';
import { 
  PrinterOutlined, 
  DownOutlined, 
  FileExcelOutlined, 
  FilePdfOutlined 
} from '@ant-design/icons-vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {useTabsStore} from "~/stores/tabsStore.js";
import attributesValuesTable from "~/components/product/attributes/attributesValuesTable.vue";
import invoice from "~/components/sales/invoice.vue";
import {useSettingsStore} from "~/stores/settingsStore.js";

const tabsStore = useTabsStore();
const settingsStore = useSettingsStore();

// Props
const props = defineProps({
  orderId: {
    type: Number,
    required: true,
  },
});

// Order data
const orderDetails = ref({});

// Table columns
const columns = [
  {
    title: 'Product',
    dataIndex: 'product',
    key: 'product',
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'Unit Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Total Price',
    dataIndex: 'total',
    key: 'total',
  },
];

// Fetch the order details when the component is mounted
onMounted(async () => {
  await fetchOrderDetails();
});

// Fetch the order details by orderId
const fetchOrderDetails = async () => {
  try {
    const salesOrderStore = useSalesOrderStore();
    orderDetails.value = await salesOrderStore.fetchOrderById(props.orderId);
    console.log("orderDetails.value", orderDetails.value);
  } catch (error) {
    console.error('Error fetching order:', error);
  }
};

// Get status color
const getStatusColor = (status) => {
  const statusColors = {
    'Pending': 'orange',
    'Processing': 'blue',
    'Shipped': 'green',
    'Delivered': 'cyan',
    'Cancelled': 'red',
  };
  return statusColors[status] || 'default';
};

// Get order progress
const getOrderProgress = (status) => {
  const progressMap = {
    'Pending': 20,
    'Processing': 40,
    'Shipped': 60,
    'Delivered': 100,
    'Cancelled': 100,
  };
  return progressMap[status] || 0;
};

// Get order progress status
const getOrderProgressStatus = (status) => {
  return status === 'Cancelled' ? 'exception' : 'active';
};

// Handle print
const handlePrint = (type) => {
  if (type === 'invoice') {
    console.log('Printing invoice');
    tabsStore.addTab('Invoice', invoice, { orderId: props.orderId });
  } else if (type === 'receipt') {
    console.log('Printing receipt');
    // Implement receipt printing logic
  }
  window.print();
};

// Export to Excel
const exportToExcel = () => {
  const data = [
    ['Order ID', orderDetails.value.id],
    ['Customer', orderDetails.value.customer ? orderDetails.value.customer.name : 'None'],
    ['Order Total', orderDetails.value.total],
    ['Order Date', orderDetails.value.createdAt],
    ['Status', orderDetails.value.status],
    [],
    ['Product', 'Quantity', 'Unit Price', 'Total Price'],
    ...orderDetails.value.lineItems.map(item => [
      item.variant.Product.name,
      item.quantity,
      item.price,
      item.total
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Order Details");
  XLSX.writeFile(wb, `Order_${orderDetails.value.id}.xlsx`);
};

// Export to PDF
const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text(`Order #${orderDetails.value.id}`, 14, 15);
  
  doc.autoTable({
    startY: 20,
    head: [['', '']],
    body: [
      ['Customer', orderDetails.value.customer ? orderDetails.value.customer.name : 'None'],
      ['Order Total', `${settingsStore.getSettingByKey("default_currency")?.code} ${orderDetails.value.total.toFixed(2)}`],
      ['Order Date', new Date(orderDetails.value.createdAt).toLocaleDateString()],
      ['Status', orderDetails.value.status],
    ],
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Product', 'Quantity', 'Unit Price', 'Total Price']],
    body: orderDetails.value.lineItems.map(item => [
      item.variant.Product.name,
      item.quantity,
      `${settingsStore.getSettingByKey("default_currency")?.code} ${item.price.toFixed(2)}`,
      `${settingsStore.getSettingByKey("default_currency")?.code} ${item.total.toFixed(2)}`
    ]),
  });

  doc.save(`Order_${orderDetails.value.id}.pdf`);
};
</script>

<style scoped>
.order-view-container {
  background-color: #f0f2f5;
  padding: 24px;
}

.header-card,
.summary-card,
.line-items-card,
.coupon-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header {
  padding: 16px;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
}

:deep(.ant-card-head-title) {
  padding: 16px 0;
  font-size: 18px;
  font-weight: 600;
}

:deep(.ant-card-body) {
  padding: 24px;
}

:deep(.ant-descriptions-title) {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 500;
}

.order-total-statistic {
  text-align: center;
}

:deep(.ant-statistic-title) {
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
}

:deep(.ant-statistic-content) {
  font-size: 28px;
  font-weight: 600;
  color: #1890ff;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  color: #001529;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 16px;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}

.product-cell {
  display: flex;
  align-items: center;
}

.product-info {
  margin-left: 12px;
}

.product-name {
  font-weight: 500;
}

.product-sku {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

@media print {
  .header-card :deep(.ant-page-header-extra) {
    display: none;
  }
}
</style>
