<template>
  <div class="purchase-orders-container">
    <!-- Modals -->
    <a-modal
      v-model:open="open"
      :footer="null"
      :maskClosable="false"
      width="100%"
      wrap-class-name="full-modal"

    >
      <purchase-order-add-modal @submit-success="handleSubmitSuccess"></purchase-order-add-modal>
    </a-modal>

    <a-modal
      v-model:open="edit_open"
      :footer="null"
      :maskClosable="false"
      width="100%"
      wrap-class-name="full-modal"
    >
      <purchase-order-edit-modal
        @submit-success="handleSubmitSuccess"
        :purchaseOrderId="purchase_order_id"
      ></purchase-order-edit-modal>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Purchase Orders"
        sub-title="Manage and organize your purchase orders"
      >
        <template #extra>
          <a-button
            class="add-purchase-order-btn"
            type="primary"
            @click="handleAdd"
            :icon="h(PlusOutlined)"
          >
            Create Purchase Order
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

    <!-- Purchase Orders table -->
    <div class="table-container">
      <a-table
        :dataSource="purchaseOrderStore.purchaseOrders"
        :columns="columns"
        :pagination="pagination"
        :rowKey="(record) => record.id"
        :loading="purchaseOrderStore.loading"
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
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'id'">
            {{ settingsStore.getSettingByKey("default_purchase_order_prefix")}}{{record.id}}
          </template>
          <template v-if="column.dataIndex === 'orderDate'">
            {{ formatDate(record.orderDate) }}
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="View">
                <a-button
                  type="link"
                  class="values-btn"
                  @click="onValues(record.id)"
                  :style="{ color: '#1890ff' }"
                ><template #icon><EyeOutlined /></template>

                </a-button>
              </a-tooltip>
<!--              <a-tooltip v-if="['ordered', 'partial'].includes(record.status)" title="Receive">-->
              <a-tooltip  title="Receive">
                <a-button
                  type="link"
                  class="receive-btn"
                  @click="receiveGoods(record.id)"
                  :style="{ color: '#52c41a' }"
                >
                  <template #icon><OrderedListOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Edit">
                <a-button
                  type="link"
                  class="edit-btn"
                  @click="onEdit(record.id)"
                  :style="{ color: '#faad14' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                :title="`Are you sure you want to delete this purchase order?`"
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
import { usePurchaseOrderStore } from '~/stores/purchases/PurchaseOrderStore.js';
import { useTabsStore } from "~/stores/tabsStore.js";
import PurchaseOrderAddModal from "~/components/purchases/purchaseOrderAddModal.vue";
import PurchaseOrderEditModal from "~/components/purchases/purchaseOrderEditModal.vue";
import purchaseOrderView from "~/components/purchases/purchaseOrderView.vue";
import GoodsReceivingForm from "~/components/inventory/receive/GoodsReceivingAdd.vue";
const { initDateFormat, formatDate } = useDateFormatter();
const settingsStore = useSettingsStore();
import {
  DeleteOutlined,
  EditOutlined,
  OrderedListOutlined,
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons-vue";
import {useSettingsStore} from "~/stores/settingsStore.js";

const tabsStore = useTabsStore();
const purchaseOrderStore = usePurchaseOrderStore();
const open = ref(false);
const edit_open = ref(false);
let purchase_order_id = ref(null);

purchaseOrderStore.fetchPurchaseOrders();
console.log("purchaseOrderStore.purchaseOrders",purchaseOrderStore.purchaseOrders)
// Table columns configuration
const columns = [
  {
    title: 'Purchase Number',
    dataIndex: 'id',
    key: 'purchase_number',
    sorter: (a, b) => a.id.localeCompare(b.id),
    customFilterDropdown: true,
    onFilter: (value, record) => record.id.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Order Date',
    dataIndex: 'orderDate',
    key: 'orderDate',
    sorter: (a, b) => a.orderDate.localeCompare(b.orderDate),
    customFilterDropdown: true,
    onFilter: (value, record) => record.orderDate.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Supplier',
    customRender: ({record}) => record.supplier ? record.supplier.name : '',
    key: 'supplier',
    sorter: (a, b) => a.supplier.localeCompare(b.supplier),
    customFilterDropdown: true,
    onFilter: (value, record) => record.supplier.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Warehouse',
    customRender: ({record}) => record.warehouse ? record.warehouse.name : '',
    key: 'warehouse',
    sorter: (a, b) => a.warehouse.localeCompare(b.warehouse),
    customFilterDropdown: true,
    onFilter: (value, record) => record.warehouse.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Store',
    customRender: ({record}) => record.store ? record.store.name : '',
    key: 'store',
    sorter: (a, b) => a.store.localeCompare(b.store),
    customFilterDropdown: true,
    onFilter: (value, record) => record.store.toString().toLowerCase().includes(value.toLowerCase()),
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

const pagination = ref({pageSize: 10});

// Event handlers
const onValues = async key => {
  tabsStore.addTab('Purchase Order', purchaseOrderView, { purchaseOrderId: key });
};

const receiveGoods = async key => {
    tabsStore.addTab('Receive Goods', GoodsReceivingForm, { purchaseOrderId: key });

};

const onDelete = async key => {
  await purchaseOrderStore.deletePurchaseOrder(key);
};

const onEdit = async key => {
  purchase_order_id.value = parseInt(key);
  edit_open.value = true;
};

const handleAdd = () => {
  open.value = true;
};

const handleSubmitSuccess = () => {
  open.value = false;
  edit_open.value = false;
};

const onChange = (pagination, filters, sorter) => {
  console.log('params', pagination, filters, sorter);
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
};

// TODO: Implement these functions
const exportToExcel = () => {
  // Implementation for exporting to Excel
};

const exportToPDF = () => {
  // Implementation for exporting to PDF
};
onMounted(async () => {
  await initDateFormat();
});
</script>

<style scoped>
.purchase-orders-container {
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

.add-purchase-order-btn {
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
