<template>
  <div class="order-container">
    <!-- Modals -->
    <a-modal
      v-model:open="edit_open"
      title="Edit Order"
      :footer="null"
      :maskClosable="false"
    >
      <order-edit-modal
        @submit-success="handleSubmitSuccess"
        :order-id="order_id"
      ></order-edit-modal>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Orders"
        sub-title="Manage and organize your sales orders"
      >
        <template #extra>
          <a-button
            class="add-order-btn"
            type="primary"
            @click="handleAdd"
            :icon="h(PlusOutlined)"
          >
            Create New Sale
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

    <!-- Orders table -->
    <div class="table-container">
      <a-table
        :dataSource="orderStore.orders"
        :columns="columns"
        :pagination="pagination"
        :rowKey="(record) => record.id"
        :loading="orderStore.loading"
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
          <template v-if="column.dataIndex === 'id'">
            {{ settingsStore.getSettingByKey("default_sales_order_prefix")}}{{record.id}}
          </template>
          <template v-if="column.dataIndex === 'totalAmount'">
            {{ record.totalAmount }} {{ settingsStore.getSettingByKey("default_currency")?.code }}
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
                  :style="{ color: '#52c41a' }"
                >
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Generate Delivery">
                <a-button
                  type="link"
                  class="delivery-btn"
                  @click="onGenerateDelivery(record.id)"
                  :style="{ color: '#faad14' }"
                >
                  <template #icon><FilePdfOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                title="Are you sure you want to delete this order?"
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
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js';
import { useSettingsStore } from '~/stores/settingsStore.js';
import OrderEditModal from '~/components/sales/OrderEditModal.vue';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EyeOutlined,
} from "@ant-design/icons-vue";
import { useTabsStore } from "~/stores/tabsStore.js";
import createOrder from "~/components/sales/orderAddModule.vue";
import orderView from "~/components/sales/orderView.vue";

const orderStore = useSalesOrderStore();
const settingsStore = useSettingsStore();
const tabsStore = useTabsStore();

const edit_open = ref(false);
const order_id = ref(null);
const searchInput = ref(null);

orderStore.fetchOrders();
settingsStore.fetchSettings();

const columns = [
  {
    title: 'Order Number',
    dataIndex: 'id',
    key: 'order_number',
    sorter: (a, b) => a.id.localeCompare(b.id),
    customFilterDropdown: true,
    onFilter: (value, record) => record.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Customer',
    customRender: ({record}) => record.customer ? record.customer.name : 'N/A',
    key: 'customer_name',
    customFilterDropdown: true,
    onFilter: (value, record) => record.customer?.name.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Total Amount',
    dataIndex: 'totalAmount',
    key: 'totalAmount',
    sorter: (a, b) => a.totalAmount - b.totalAmount,
  },
  {
    title: 'Date',
    dataIndex: 'created_at',
    key: 'created_at',
    sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: 'Pending', value: 'pending' },
      { text: 'Completed', value: 'completed' },
      { text: 'Cancelled', value: 'cancelled' },
    ],
    onFilter: (value, record) => record.status.indexOf(value) === 0,
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const pagination = ref({
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
});

const onEdit = (key) => {
  order_id.value = key;
  edit_open.value = true;
};

const onView = (key) => {
  tabsStore.addTab('Sales Order', orderView, { orderId: key });
};

const onDelete = async (key) => {
  await orderStore.deleteOrder(key);
};

const onGenerateDelivery = async (key) => {
  await orderStore.createDelivery(key);
};

const handleAdd = () => {
  tabsStore.addTab('Create Sales Order', createOrder);
};

const handleSubmitSuccess = () => {
  edit_open.value = false;
};

const onChange = (pag, filters, sorter) => {
  console.log('Table params', pag, filters, sorter);
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
};

const exportToExcel = () => {
  // Implement Excel export functionality
};

const exportToPDF = () => {
  // Implement PDF export functionality
};
</script>

<style scoped>
.order-container {
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

.add-order-btn {
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
