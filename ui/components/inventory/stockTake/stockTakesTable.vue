<template>
  <div class="stock-take-container">
    <!-- Modals -->
    <a-modal
      v-model:open="open"
      title="Create Stock Take"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <stockTake @submit-success="handleSubmitSuccess"></stockTake>
      <template #footer> </template>
    </a-modal>

    <a-modal
      v-model:open="edit_open"
      title="Edit Stock Take"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <stockTakeDetail
        @submit-success="handleSubmitSuccess"
        :stockTakeId="stockTakeId"
        stock_take_id=""
      ></stockTakeDetail>
      <template #footer> </template>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Stock Takes"
        sub-title="Manage and organize your stock takes"
      >
        <template #extra>
          <a-button
            class="add-stock-take-btn"
            type="primary"
            @click="onCreate"
            :icon="h(PlusOutlined)"
          >
            Add New
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

    <!-- Stock Takes table -->
    <div class="table-container">
      <a-table
        :dataSource="stockTakeStore.stockTakes"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="stockTakeStore.loading"
        size="middle"
        @change="onChange"
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
              @change="
                (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
              "
              @pressEnter="
                handleSearch(selectedKeys, confirm, column.dataIndex)
              "
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
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'systemQuantity'">
            {{record.systemQuantity}} {{record?.variant?.Product?.Unit?.abbreviation}}
          </template>
          <template v-if="column.dataIndex === 'difference'">
            {{record.difference}} {{record?.variant?.Product?.Unit?.abbreviation}}
          </template>
          <template v-if="column.dataIndex === 'physicalQuantity'">
            {{record.physicalQuantity}} {{record?.variant?.Product?.Unit?.abbreviation}}
          </template>
          <template v-if="column.dataIndex === 'status'">
            <span>
              <a-tag v-if="record.status === 'pending'" color="processing">Pending</a-tag>
              <a-tag v-if="record.status === 'completed'" color="success">Completed</a-tag>
            </span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                  type="link"
                  class="edit-btn"
                  @click="onEdit(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="View">
                <a-button
                  type="link"
                  class="view-btn"
                  @click="onView(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                :title="`Are you sure you want to delete this stock take?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="onDelete(record.id)"
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
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStockTakeStore } from '~/stores/invetory/StockTakeStore.js';
import { useTabsStore } from '~/stores/tabsStore.js';
import stockTakeDetail from '~/components/inventory/stockTake/stockTakeDetail.vue';
import stockTake from '~/components/inventory/stockTake/stockTake.vue';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons-vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const tabsStore = useTabsStore();
const stockTakeStore = useStockTakeStore();
const open = ref(false);
const edit_open = ref(false);
const stockTakeId = ref(null);
const searchInput = ref(null);

const columns = [
  {
    title: '#',
    dataIndex: 'index',
    width: '5%',
    sorter: (a, b) => a.index.localeCompare(b.index),
    onFilter: (value, record) =>
      record.index.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    sorter: (a, b) => new Date(a.date) - new Date(b.date),
  },
  {
    title: 'Product',
    customRender: ({ record }) =>
      record.variant ? record?.variant?.Product?.name : '',
    key: 'Product',
  },
  {
    title: 'Variant',
    customRender: ({ record }) =>
      record.variant ? record?.variant?.sku : '',
    key: 'variantId',
  },
  {
    title: 'Store',
    customRender: ({ record }) => (record.store ? record?.store?.name : ''),
    key: 'store',
  },
  {
    title: 'Warehouse',
    customRender: ({ record }) =>
      record.warehouse ? record?.warehouse?.name : '',
    key: 'warehouse',
  },
  {
    title: 'System Quantity',
    dataIndex: 'systemQuantity',
    key: 'systemQuantity',
  },
  {
    title: 'Physical Quantity',
    dataIndex: 'physicalQuantity',
    key: 'physicalQuantity',
  },
  {
    title: 'Difference',
    dataIndex: 'difference',
    key: 'difference',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const pagination = ref({ pageSize: 10 });

const fetchStockTakes = async () => {
  await stockTakeStore.fetchStockTakes();
};

const onDelete = async (key) => {
  await stockTakeStore.deleteStockTake(key);
  console.log('Deleted', key);
};

const onEdit = async (key) => {
  console.log('Edit', key);
  stockTakeId.value = parseInt(key);
  console.log('StockTake ID', stockTakeId.value);
  edit_open.value = true;
  console.log('Done');
};

const onView = async (key) => {
  tabsStore.addTab('Edit Good Received', stockTakeDetail, {
    stock_take_id: key,
  });
};

const onCreate = async () => {
  tabsStore.addTab('Edit Good Received', stockTake);
};

const handleOk = () => {
  open.value = false;
  // Optionally handle any additional logic here
};

const handleCancel = () => {
  open.value = false;
  edit_open.value = false;
};

const handleSubmitSuccess = () => {
  open.value = false;
  edit_open.value = false;
};

const onChange = (pagination, filters, sorter) => {
  console.log('Params', pagination, filters, sorter);
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
};

const exportToExcel = () => {
  const data = stockTakeStore.stockTakes.map(stockTake => ({
    Date: stockTake.date,
    Product: stockTake.variant?.Product?.name,
    Variant: stockTake.variant?.sku,
    Store: stockTake.store?.name,
    Warehouse: stockTake.warehouse?.name,
    SystemQuantity: stockTake.systemQuantity,
    PhysicalQuantity: stockTake.physicalQuantity,
    Difference: stockTake.difference,
    Status: stockTake.status
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Takes");
  XLSX.writeFile(wb, "stock_takes.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Date', 'Product', 'Variant', 'Store', 'Warehouse', 'System Quantity', 'Physical Quantity', 'Difference', 'Status']],
    body: stockTakeStore.stockTakes.map(stockTake => [
      stockTake.date,
      stockTake.variant?.Product?.name,
      stockTake.variant?.sku,
      stockTake.store?.name,
      stockTake.warehouse?.name,
      stockTake.systemQuantity,
      stockTake.physicalQuantity,
      stockTake.difference,
      stockTake.status
    ]),
  });
  doc.save('stock_takes.pdf');
};

onMounted(() => {
  fetchStockTakes();
});
console.log('stockTakeStore.stockTakes', stockTakeStore.stockTakes);
</script>

<style scoped>
.stock-take-container {
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

.add-stock-take-btn {
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
