<template>
  <div class="order-view-container">
    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Order Details"
        :sub-title="`Order #${orderDetails.id}`"
      >
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
    <a-card class="summary-card" title="Order Summary" :bordered="false">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-statistic title="Customer" :value="orderDetails.customer ? orderDetails.customer.name : 'None'" />
        </a-col>
        <a-col :span="12">
          <a-statistic title="Order Total" :value="orderDetails.total" :precision="2" prefix="$" />
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="12">
          <a-statistic title="Order Date" :value="orderDetails.createdAt | formatDate" />
        </a-col>
        <a-col :span="12">
          <a-statistic title="Status">
            <template #value>
              <a-tag :color="getStatusColor(orderDetails.status)">
                {{ orderDetails.status }}
              </a-tag>
            </template>
          </a-statistic>
        </a-col>
      </a-row>
    </a-card>

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
            <div>
              <div>{{ record.variant.Product.name }}</div>
              <div class="text-secondary">SKU: {{ record.variant.sku }}</div>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'price'">
            {{ record.price | currency }}
          </template>
          <template v-else-if="column.dataIndex === 'totalPrice'">
            {{ record.totalPrice | currency }}
          </template>
        </template>
      </a-table>
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
const tabsStore = useTabsStore();
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
    dataIndex: 'totalPrice',
    key: 'totalPrice',
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

// Handle print
const handlePrint = (type) => {
  // Here you can implement different logic for invoice and receipt
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
      item.totalPrice
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
      ['Order Total', `$${orderDetails.value.total.toFixed(2)}`],
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
      `$${item.price.toFixed(2)}`,
      `$${item.totalPrice.toFixed(2)}`
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

.header-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header {
  padding: 16px;
}

.summary-card,
.line-items-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
}

:deep(.ant-card-head-title) {
  padding: 16px 0;
  font-size: 16px;
  font-weight: 600;
}

:deep(.ant-card-body) {
  padding: 24px;
}

:deep(.ant-statistic-title) {
  color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-statistic-content) {
  font-size: 20px;
  font-weight: 600;
}

.text-secondary {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
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

@media print {
  .header-card :deep(.ant-page-header-extra) {
    display: none;
  }
}
</style>
