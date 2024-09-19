<template>
  <div class="stock-adjustments-container">
    <a-card title="Stock Adjustments" bordered={false}>
      <div class="header-controls">
        <div class="actions">
          <a-button type="primary" @click="onCreate" :icon="h(PlusOutlined)">Add New</a-button>
        </div>
      </div>

      <a-table
          :columns="columns"
          :data-source="stockAdjustmentStore.stockAdjustments"
          :pagination="pagination"
          :rowKey="id"
          bordered
          size="small"
          @change="onChange"
      >
        <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
          <div style="padding: 8px">
            <a-input
                ref="searchInput"
                :placeholder="`Search ${column.dataIndex}`"
                :value="selectedKeys[0]"
                style="width: 188px; margin-bottom: 8px; display: block"
                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
                type="primary"
                size="small"
                style="width: 90px; margin-right: 8px"
                @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon><SearchOutlined /></template>
              Search
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
              Reset
            </a-button>
          </div>
        </template>
        <template #customFilterIcon="{ filtered }">
          <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'adjustmentQuantity'">
            {{record.adjustmentQuantity}} {{record?.variant?.Product?.Unit?.abbreviation}}
          </template>
          <template v-if="column.dataIndex === 'reason'">
            {{record.reason}}
          </template>
          <template v-if="column.dataIndex === 'status'">
            <span>
              <a-tag v-if="record.status === 'pending'" color="processing">Pending</a-tag>
              <a-tag v-if="record.status === 'approved'" color="success">Approved</a-tag>
            </span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-popconfirm
                v-if="stockAdjustmentStore.stockAdjustments.length"
                title="Sure to delete?"
                @confirm="onDelete(record.id)"
            >
              <a-tooltip title="Delete" placement="bottom">
                <a-button :icon="h(DeleteOutlined)"/>
              </a-tooltip>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useStockAdjustmentStore } from '~/stores/invetory/stockAdjustmentStore.js'; // Adjust the path if necessary
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons-vue";
import { useTabsStore } from "~/stores/tabsStore.js";

const tabsStore = useTabsStore();
const stockAdjustmentStore = useStockAdjustmentStore();
const open = ref(false);
const edit_open = ref(false);
const stockAdjustmentId = ref(null);
const searchInput = ref(null);

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
  },{
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
  }
  ,{
    title: 'Raised By',
    customRender: ({ record }) => record?.createdByUser ? record?.createdByUser?.name : '',
    key: 'createdByUser',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },{
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

const pagination = ref({ pageSize: 10 });

const fetchStockAdjustments = async () => {
  await stockAdjustmentStore.fetchStockAdjustments();
};

const onDelete = async key => {
  await stockAdjustmentStore.deleteStockAdjustment(key);
  console.log("Deleted", key);
};

const onEdit = async key => {
  await stockAdjustmentStore.approveStockAdjustment(parseInt(key))
};

const onView = async key => {
  // tabsStore.addTab('Stock Adjustment Detail', stockAdjustmentDetail, { stock_adjustment_id: key });
};

const onCreate = async () => {
  // tabsStore.addTab('Create Stock Adjustment', stockAdjustmentCreate);
};

const handleAdd = () => {
  open.value = true;
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

const handleReset = clearFilters => {
  clearFilters({ confirm: true });
};

onMounted(() => {
  fetchStockAdjustments();
});
console.log("stockAdjustmentStore.stockAdjustments", stockAdjustmentStore.stockAdjustments);
</script>

<style scoped>
.stock-adjustments-container {
  max-width: 100%;
  margin: 0 auto;
}
</style>
