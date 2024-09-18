<template>
  <div class="stock-takes-container">
    <a-card title="Stock Takes" bordered={false}>
      <div class="header-controls">
        <div class="actions">
          <a-button type="primary" @click="onCreate" :icon="h(PlusOutlined)">Add New</a-button>
        </div>
      </div>

      <a-table
          :columns="columns"
          :data-source="stockTakeStore.stockTakes"
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
          <template v-if="column.dataIndex === 'status'">
            <span>
             <a-tag v-if="record.status === 'pending'"  color="processing">Pending</a-tag>
             <a-tag v-if="record.status === 'completed'"  color="success">Completed</a-tag>
            </span>
          </template>

        </span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onView(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-popconfirm
                v-if="stockTakeStore.stockTakes.length"
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
import { useStockTakeStore } from '~/stores/StockTakeStore.js';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons-vue";
import {useTabsStore} from "~/stores/tabsStore.js";
import stockTakeDetail from "~/components/inventory/stockTake/stockTakeDetail.vue";
import stockTake from "~/components/inventory/stockTake/stockTake.vue";
const tabsStore = useTabsStore();
const stockTakeStore = useStockTakeStore();
const open = ref(false);
const edit_open = ref(false);
const stockTakeId = ref(null);
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
    customRender: ({record}) => record.variant ? record?.variant?.Product?.name : '',
    key: 'Product',
  },
  {
    title: 'Variant',
    customRender: ({record}) => record.variant ? record?.variant?.sku : '',
    key: 'variantId',
  },
  {
    title: 'Store',
    customRender: ({record}) => record.store ? record?.store?.name : '',
    key: 'store',
  },
  {
    title: 'Warehouse',
    customRender: ({record}) => record.warehouse ? record?.warehouse?.name : '',
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

const onDelete = async key => {
  await stockTakeStore.deleteStockTake(key);
  console.log("Deleted", key);
};

const onEdit = async key => {
  console.log("Edit", key);
  stockTakeId.value = parseInt(key);
  console.log("StockTake ID", stockTakeId.value);
  edit_open.value = true;
  console.log("Done");
};
const onView = async key => {
  tabsStore.addTab('Edit Good Received', stockTakeDetail, { stock_take_id: key });
};
const onCreate = async() => {
  tabsStore.addTab('Edit Good Received', stockTake, );
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
  fetchStockTakes();
});
console.log("stockTakeStore.stockTakes",stockTakeStore.stockTakes)
</script>
