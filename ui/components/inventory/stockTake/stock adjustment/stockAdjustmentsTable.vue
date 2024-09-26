<template>
  <div class="stock-adjustments-container">
    <!-- Modals -->
    <a-modal
      v-model:open="isAddModalOpen"
      title="Create Stock Adjustment"
      :footer="null"
      :maskClosable="false"
    >
      <stock-adjustment-add-modal @submit-success="handleSubmitSuccess"></stock-adjustment-add-modal>
    </a-modal>

    <a-modal
      v-model:open="isEditModalOpen"
      title="Edit Stock Adjustment"
      :footer="null"
      :maskClosable="false"
    >
      <stock-adjustment-edit-modal
        @submit-success="handleSubmitSuccess"
        :selectedStockAdjustmentId="selectedStockAdjustmentId"
      ></stock-adjustment-edit-modal>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Stock Adjustments"
        sub-title="Manage and organize your stock adjustments"
      >
        <template #extra>
          <a-button
            class="add-stock-adjustment-btn"
            type="primary"
            @click="handleAddStockAdjustment"
            :icon="h(PlusOutlined)"
          >
            Create Stock Adjustment
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

    <!-- Stock Adjustments table -->
    <div class="table-container">
      <a-table
        :dataSource="stockAdjustmentStore.stockAdjustments"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="stockAdjustmentStore.loading"
        size="middle"
        @change="handleTableChange"
      >
        <!-- Custom filter dropdown template -->
        <template
          #customFilterDropdown="{
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            column,
          }"
        >
          <div class="custom-filter-dropdown">
            <a-input
              ref="searchInput"
              :placeholder="`Search ${column.title}`"
              :value="selectedKeys[0]"
              @change="(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
              type="primary"
              @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon><SearchOutlined /></template>
              Search
            </a-button>
            <a-button @click="handleReset(clearFilters)">
              Reset
            </a-button>
          </div>
        </template>

        <!-- Custom filter icon -->
        <template #customFilterIcon="{ filtered }">
          <search-outlined :class="{ 'text-primary': filtered }" />
        </template>

        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                  type="link"
                  class="edit-btn"
                  @click="handleEditStockAdjustment(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                :title="`Are you sure you want to delete this stock adjustment?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="handleDeleteStockAdjustment(record.id)"
                placement="topRight"
              >
                <a-tooltip title="Delete">
                  <a-button
                    type="link"
                    class="delete-btn"
                    :style="{ color: '#ff4d4f' }"
                  >
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="view">
                      <EyeOutlined /> View Details
                    </a-menu-item>
                    <a-menu-item key="approve">
                      <CheckOutlined /> Approve
                    </a-menu-item>
                    <a-menu-item key="archive">
                      <InboxOutlined /> Archive
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link">
                  <MoreOutlined style="font-size: 16px;" />
                </a-button>
              </a-dropdown>
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStockAdjustmentStore } from '~/stores/invetory/stockAdjustmentStore.js';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EyeOutlined,
  CheckOutlined,
  InboxOutlined,
  MoreOutlined,
} from "@ant-design/icons-vue";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Initialize stock adjustment store and fetch stock adjustments
const stockAdjustmentStore = useStockAdjustmentStore();
stockAdjustmentStore.fetchStockAdjustments();

// Reactive variables
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedStockAdjustmentId = ref(null);
const searchInput = ref(null);

// Table columns configuration
const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    sorter: (a, b) => new Date(a.date) - new Date(b.date),
  },
  {
    title: 'Product',
    customRender: ({ record }) => record.variant ? record?.variant?.Product?.name : '',
    key: 'Product',
  },
  {
    title: 'Variant SKU',
    customRender: ({ record }) => record.variant ? record?.variant?.sku : '',
    key: 'variantId',
  },
  {
    title: 'Store',
    customRender: ({ record }) => record.store ? record?.store?.name : '',
    key: 'store',
  },
  {
    title: 'Warehouse',
    customRender: ({ record }) => record.warehouse ? record?.warehouse?.name : '',
    key: 'warehouse',
  },
  {
    title: 'Adjustment Quantity',
    dataIndex: 'adjustmentQuantity',
    key: 'adjustmentQuantity',
  },
  {
    title: 'Reason',
    dataIndex: 'reason',
    key: 'reason',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'Raised By',
    customRender: ({ record }) => record?.createdByUser ? record?.createdByUser?.name : '',
    key: 'createdByUser',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Approved By',
    customRender: ({ record }) => record?.approvedByUser ? record?.approvedByUser?.name : '',
    key: 'approvedByUser',
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

// Event handlers
const handleAddStockAdjustment = () => {
  isAddModalOpen.value = true;
};

const handleEditStockAdjustment = (stockAdjustmentId) => {
  selectedStockAdjustmentId.value = stockAdjustmentId;
  isEditModalOpen.value = true;
};

const handleDeleteStockAdjustment = async (stockAdjustmentId) => {
  try {
    await stockAdjustmentStore.deleteStockAdjustment(stockAdjustmentId);
  } catch (error) {
    console.error("Error deleting stock adjustment:", error);
  }
};

const handleSubmitSuccess = () => {
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
};

const handleTableChange = (pagination, filters, sorter) => {
  console.log('Table changed:', pagination, filters, sorter);
};

const exportToExcel = () => {
  const data = stockAdjustmentStore.stockAdjustments.map(adjustment => ({
    Date: adjustment.date,
    Product: adjustment.variant?.Product?.name,
    'Variant SKU': adjustment.variant?.sku,
    Store: adjustment.store?.name,
    Warehouse: adjustment.warehouse?.name,
    'Adjustment Quantity': adjustment.adjustmentQuantity,
    Reason: adjustment.reason,
    Type: adjustment.type,
    'Raised By': adjustment.createdByUser?.name,
    Status: adjustment.status,
    'Approved By': adjustment.approvedByUser?.name,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Adjustments");
  XLSX.writeFile(wb, "stock_adjustments.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Date', 'Product', 'Variant SKU', 'Store', 'Warehouse', 'Adjustment Quantity', 'Reason', 'Type', 'Raised By', 'Status', 'Approved By']],
    body: stockAdjustmentStore.stockAdjustments.map(adjustment => [
      adjustment.date,
      adjustment.variant?.Product?.name,
      adjustment.variant?.sku,
      adjustment.store?.name,
      adjustment.warehouse?.name,
      adjustment.adjustmentQuantity,
      adjustment.reason,
      adjustment.type,
      adjustment.createdByUser?.name,
      adjustment.status,
      adjustment.approvedByUser?.name,
    ]),
  });
  doc.save('stock_adjustments.pdf');
};

onMounted(() => {
  stockAdjustmentStore.fetchStockAdjustments();
});
</script>

<style scoped>
.stock-adjustments-container {
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

.header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
}

.add-stock-adjustment-btn {
  font-size: 14px;
  height: 36px;
  margin-right: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.export-btn {
  height: 36px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-container {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.custom-filter-dropdown {
  padding: 8px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.custom-filter-dropdown input {
  width: 200px;
  margin-bottom: 8px;
  display: block;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-filter-dropdown button {
  width: 100px;
  margin-right: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-primary {
  color: #1890ff;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .ant-btn-link {
  padding: 0;
}
</style>
