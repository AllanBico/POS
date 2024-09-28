<template>
  <div class="goods-receiving-container">
    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Goods Receiving"
        sub-title="Manage and organize your received goods"
      >
        <template #extra>
<!--          <a-button-->
<!--            class="add-goods-btn"-->
<!--            type="primary"-->
<!--            @click="handleAdd"-->
<!--            :icon="h(PlusOutlined)"-->
<!--          >-->
<!--            Add Goods Received-->
<!--          </a-button>-->
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

    <!-- Goods Receiving table -->
    <div class="table-container">
      <a-table
        :dataSource="goodsReceivedList"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="goodsReceivingStore.loading"
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
          <template v-if="column.dataIndex === 'receivedDate'">
            {{ formatDate(record.receivedDate) }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            <a-tag
              :color="
                record.status === 'pending'
                  ? 'orange'
                  : record.status === 'complete'
                  ? 'green'
                  : 'blue'
              "
            >
              {{ record.status }}
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
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
              <a-popconfirm
                :title="`Are you sure you want to delete this record?`"
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
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGoodsReceivingStore } from '~/stores/invetory/GoodsReceivingStore.js';
import { useTabsStore } from "~/stores/tabsStore.js";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons-vue";
import GoodsReceivingForm from "~/components/inventory/receive/GoodsReceivingAdd.vue";
import goodReceivedEdit from "~/components/inventory/receive/goodReceivedEdit.vue";
import goodsReceivedView from "~/components/inventory/receive/goodReceivedView.vue";
const { initDateFormat, formatDate } = useDateFormatter();
const goodsReceivingStore = useGoodsReceivingStore();
const goodsReceivedList = ref([]);
const tabsStore = useTabsStore();

// Fetch all GRNs
goodsReceivingStore.fetchGoodsReceived().then(() => {
  goodsReceivedList.value = goodsReceivingStore.goodsReceived;
});

const columns = [
  {
    title: 'Received Date',
    dataIndex: 'receivedDate',
    key: 'receivedDate',
    sorter: (a, b) => new Date(a.receivedDate) - new Date(b.receivedDate),
    customFilterDropdown: true,
  },
  {
    title: 'Warehouse',
    customRender: ({record}) => record.warehouse ? record.warehouse.name : '',
    sorter: (a, b) => a.warehouse.name.localeCompare(b.warehouse.name),
    customFilterDropdown: true,
  },{
    title: 'Store',
    customRender: ({record}) => record.store ? record.store.name : '',
    sorter: (a, b) => a.store.name.localeCompare(b.store.name),
    customFilterDropdown: true,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    sorter: (a, b) => a.status.localeCompare(b.status),
    customFilterDropdown: true,
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
  },
];

const onEdit = async key => {
  tabsStore.addTab('Edit Good Received', goodReceivedEdit, { id: key });
};

const onView = async key => {
  console.log("id ",key)
  tabsStore.addTab('Good Received', goodsReceivedView, { id: key });
};

const onDelete = async key => {
  console.log("deleted", key);
  // Implement delete functionality
};

const handleAdd = () => {
  tabsStore.addTab('Add Goods Received', GoodsReceivingForm);
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  // Implement search functionality
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
};

const handleTableChange = (pagination, filters, sorter) => {
  // Implement table change handling
};

const exportToExcel = () => {
  // Implement Excel export
};

const exportToPDF = () => {
  // Implement PDF export
};
</script>

<style scoped>
.goods-receiving-container {
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

.add-goods-btn {
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
