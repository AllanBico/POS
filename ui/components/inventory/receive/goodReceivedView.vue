<template>
  <div class="goods-received-container">
    <a-drawer
      v-model:open="open"
      class="custom-class"
      root-class-name="root-class-name"
      :root-style="{ color: '#1890ff' }"
      title="Barcode Printer"
      placement="top"
      :size="size"
      :height="size"
      @after-open-change="afterOpenChange"
    >
      <barcode-print :variant_obj="variant_obj" />
    </a-drawer>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Goods Received Details"
        :sub-title="`Goods Received #${goodsReceived?.id}`"
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
            <a-button type="primary" @click="onValues(goodsReceived?.purchaseOrder?.id)">
              View Purchase Order
            </a-button>
          </a-space>
        </template>
      </a-page-header>
    </a-card>

    <div class="content-container">
      <!-- Goods Received Summary -->
      <a-card class="info-card" :bordered="false">
        <a-descriptions bordered>
          <a-descriptions-item label="Supplier">
            {{ goodsReceived?.purchaseOrder?.supplier?.name }}
          </a-descriptions-item>
          <a-descriptions-item v-if="goodsReceived?.warehouse" label="Warehouse">
            {{ goodsReceived?.warehouse?.name }}
          </a-descriptions-item>
          <a-descriptions-item v-if="goodsReceived?.store" label="Store">
            {{ goodsReceived?.store?.name }}
          </a-descriptions-item>
          <a-descriptions-item label="Received Date">
            {{ formatDate(goodsReceived?.receivedDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="Status">
            <a-tag :color="getStatusColor(goodsReceived?.status)">
              {{ goodsReceived?.status?.toUpperCase() }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Line Items -->
      <a-card class="table-card" :bordered="false">
        <a-table
          :dataSource="lineItems"
          :columns="columns"
          :pagination="false"
          :rowKey="(record) => record.id"
          class="line-items-table"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">

            <template v-if="column.dataIndex === 'variantSku'">
              <div>
                <div>{{ record.variant.sku }}</div>
                <div class="text-secondary">{{ record.variant.name }}</div>
              </div>
            </template>
            <template v-if="column.dataIndex === 'note'">
              {{ record.note || 'N/A' }}
            </template>
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="record.status === 'fully_received' ? 'green' : 'orange'">
                {{ record.status?.replace(/_/g, ' ') }}
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'serial'">
              <a-space direction="vertical">
                <template v-if="record.variant?.serialNumbers && record.variant.serialNumbers.length > 0">
                  <a-switch
                    v-model:checked="record.showSerials"
                    checked-children="Hide Serials"
                    un-checked-children="Show Serials"
                  />
                  <ul v-if="record.showSerials">
                    <li v-for="serial in record.variant.serialNumbers" :key="serial.id">
                      {{ serial.serialNumber }}
                    </li>
                  </ul>
                </template>
                <template v-else>
                  <span class="text-secondary">No serial numbers available</span>
                </template>
              </a-space>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <div class="action-buttons">
                <a-tooltip title="Print Barcode">
                  <a-button type="link" @click="onBarcode(record?.variant?.id)" :icon="h(PrinterOutlined)" />
                </a-tooltip>
              </div>
            </template>
          </template>
          <template #footer>
            <div class="table-footer">
              <strong>Total Items:</strong>
              <span class="total-amount">{{ lineItems.length }}</span>
            </div>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useGoodsReceivingStore } from '~/stores/invetory/GoodsReceivingStore.js';
import { useTabsStore } from '~/stores/tabsStore';
import purchaseOrderView from "~/components/purchases/purchaseOrderView.vue";
import { PrinterOutlined, DownOutlined, FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons-vue";
import BarcodePrint from "~/components/BarcodePrint.vue";
const { initDateFormat, formatDate } = useDateFormatter();
console.log("recevid view")
const size = '100%';
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
});

const tabsStore = useTabsStore();
const variant_obj = ref(null);
const open = ref(false);
const goodsReceivingStore = useGoodsReceivingStore();
const goodsReceived = ref(null);
const lineItems = ref([]);

const onValues = async (key) => {
  tabsStore.addTab('Purchase Order', purchaseOrderView, { purchaseOrderId: key });
};

const columns = [
  { title: 'Variant SKU', dataIndex: 'variantSku', key: 'variantSku' },
  { title: 'Received Quantity', dataIndex: 'receivedQuantity', key: 'receivedQuantity' },
  { title: 'Serial Numbers', dataIndex: 'serial', key: 'serial' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Note', dataIndex: 'note', key: 'note' },
  { title: 'Action', dataIndex: 'operation', key: 'operation' },
];

const fetchData = async () => {
  goodsReceived.value = await goodsReceivingStore.goodsReceivedById(props.id);
  lineItems.value = goodsReceived.value.lineItems?.map(item => ({
    ...item,
    showSerials: false
  })) || [];
};

function getVariant(id) {
  return lineItems.value.find(item => item.variant.id === id) || null;
}

onMounted(fetchData);

watch(() => props.id, fetchData);

const onBarcode = async key => {
  variant_obj.value = getVariant(key);
  open.value = true;
};

const afterOpenChange = bool => {
  console.log('open', bool);
};

const handlePrint = (type) => {
  console.log(`Printing ${type}`);
};

const exportToExcel = () => {
  console.log('Exporting to Excel');
};

const exportToPDF = () => {
  console.log('Exporting to PDF');
};



const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    complete: 'green',
    cancelled: 'red',
  };
  return colors[status?.toLowerCase()] || 'blue';
};
</script>

<style scoped>
.goods-received-container {
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

.text-secondary {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .ant-btn-link {
  padding: 0;
}

:deep(.ant-descriptions-item-label) {
  font-weight: 600;
}

:deep(.ant-btn) {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media print {
  .header-card :deep(.ant-page-header-extra) {
    display: none;
  }
}
</style>
