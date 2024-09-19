<template>
  <div>
    <a-modal v-model:open="open" title="Create Order" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <order-Add-modal @submit-success="handleSubmitSuccess" :order_id="order_id"></order-Add-modal>
      <template #footer></template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit Order" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <order-edit-modal @submit-success="handleSubmitSuccess" :order_id="order_id"></order-edit-modal>
      <template #footer></template>
    </a-modal>

    <!-- Orders Table -->
    <a-card title="Orders" bordered={false}>
      <div class="header-controls">
        <div class="actions">
          <a-button type="primary" @click="handleAdd" :icon="h(PlusOutlined)">Create New Sale</a-button>
        </div>
      </div>

      <a-table
          :columns="columns"
          :data-source="orderStore.orders"
          :pagination="pagination"
          :rowKey="id"
          bordered
          size="small"
          @change="onChange"
      >
        <!-- Operation Column for Edit/Delete -->
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-popconfirm title="Sure to delete?" @confirm="onDelete(record.id)">
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
import { ref } from 'vue';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js'; // Order store
import OrderEditModal from '~/components/orders/OrderEditModal.vue';
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons-vue";
const open = ref(false);
// Store and modals
const orderStore = useSalesOrderStore();
const edit_open = ref(false);
let order_id = ref(null);
orderStore.fetchOrders();

// Table columns
const columns = [
  {
    title: 'Order Number',
    dataIndex: 'order_number',
    key: 'order_number',
    sorter: (a, b) => a.order_number.localeCompare(b.order_number),
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'Customer',
    dataIndex: 'customer_name',
    key: 'customer_name',
  },
  {
    title: 'Total Amount',
    dataIndex: 'total_amount',
    key: 'total_amount',
    sorter: (a, b) => a.total_amount - b.total_amount,
  },
  {
    title: 'Date',
    dataIndex: 'created_at',
    key: 'created_at',
  },
  {
    title: 'operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

// Pagination
const pagination = ref({ pageSize: 10 });

// Actions: Edit, Delete
const onEdit = async (key) => {
  order_id = key;
  edit_open.value = true;
};

const onDelete = async (key) => {
  await orderStore.deleteOrder(key);
};
const handleAdd = () => {
  open.value = true;
};
// Modal actions
const handleOk = () => {
  edit_open.value = false;
};

const handleCancel = () => {
  edit_open.value = false;
  open.value = false;
};

const handleSubmitSuccess = () => {
  edit_open.value = false;
  open.value = false;
};

const onChange = (pagination, filters, sorter) => {
  console.log('Table params', pagination, filters, sorter);
};
</script>
