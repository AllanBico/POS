<template>
  <div>
    <a-modal v-model:open="open" title="Create Purchase Order" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel" width="100%"
             wrap-class-name="full-modal">
      <purchase-order-add-modal @submit-success="handleSubmitSuccess"></purchase-order-add-modal>
      <template #footer>
      </template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit User" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel" width="100%"
             wrap-class-name="full-modal">
      <purchase-order-edit-modal @submit-success="handleSubmitSuccess"
                                 :purchaseOrderId="purchase_order_id"></purchase-order-edit-modal>
      <template #footer>
      </template>
    </a-modal>
  </div>
  <div>
  </div>
  <div class="coupons-container">
    <a-card title="Purchase Orders" bordered={false}>
      <div class="header-controls">
        <div class="actions">
          <a-button type="primary" @click="handleAdd" :icon="h(PlusOutlined)">Add New</a-button>
        </div>
      </div>

      <a-table
          :columns="columns"
          :data-source="purchaseOrderStore.purchaseOrders"
          :pagination="pagination"
          :rowKey="id"
          bordered
          size="small"
          @change="onChange"
      >
        <template
            #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        >
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
              <template #icon>
                <SearchOutlined/>
              </template>
              Search
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
              Reset
            </a-button>
          </div>
        </template>
        <template #customFilterIcon="{ filtered }">
          <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }"/>
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-tooltip title="Values" placement="bottom">
              <a-button @click="onValues(record.id)" style="margin-right: 3px" :icon="h(OrderedListOutlined)"/>
            </a-tooltip>
            <a-tooltip title="Receive" placement="bottom">
              <a-button @click="receiveGoods(record.id)" style="margin-right: 3px" :icon="h(EyeOutlined)"/>
            </a-tooltip>
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-popconfirm
                v-if="purchaseOrderStore.purchaseOrders.length"
                title="Sure to delete?"
                @confirm="onDelete(record.id)">
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
import {computed, reactive, ref} from 'vue';
import {usePurchaseOrderStore} from '~/stores/PurchaseOrderStore.js';
import {DeleteOutlined, EditOutlined, OrderedListOutlined, PlusOutlined,EyeOutlined} from "@ant-design/icons-vue";
import PurchaseOrderAddModal from "~/components/purchases/purchaseOrderAddModal.vue";
import PurchaseOrderEditModal from "~/components/purchases/purchaseOrderEditModal.vue";
import {useTabsStore} from "~/stores/tabsStore.js";
import purchaseOrderView from "~/components/purchases/purchaseOrderView.vue";
import GoodsReceivingForm from "~/components/inventory/receive/GoodsReceivingAdd.vue";
const tabsStore = useTabsStore();
const purchaseOrderStore = usePurchaseOrderStore();
const open = ref(false);
const edit_open = ref(false);
let purchase_order_id = ref(null)
purchaseOrderStore.fetchPurchaseOrders()
console.log("purchaseOrderStore.purchaseOrders", purchaseOrderStore.purchaseOrders)
const columns = [
  {
    title: 'Order Date',
    dataIndex: 'orderDate',
    key: 'orderDate',
    sorter: (a, b) => a.orderDate.localeCompare(b.orderDate),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.orderDate.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  }
  ,
  {
    title: 'Supplier',
    customRender: ({record}) => record.supplier ? record.supplier.name : '',
    key: 'supplier',
    sorter: (a, b) => a.supplier.localeCompare(b.supplier),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.supplier.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  }
  ,
  {
    title: 'Warehouse',
    customRender: ({record}) => record.warehouse ? record.warehouse.name : '',
    key: 'description',
    sorter: (a, b) => a.warehouse.localeCompare(b.warehouse),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.warehouse.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: 'Warehouse',
    customRender: ({record}) => record.store ? record.store.name : '',
    key: 'description',
    sorter: (a, b) => a.store.localeCompare(b.store),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.store.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const onValues = async key => {
  tabsStore.addTab('Purchase Order', purchaseOrderView, { purchaseOrderId: key });
};
const receiveGoods = async key => {
  tabsStore.addTab('Receive Goods', GoodsReceivingForm, { purchaseOrderId: key });
};
const pagination = ref({pageSize: 10});
const edit = key => {
};
const save = key => {
};
const onDelete = async key => {
  await purchaseOrderStore.deletePurchaseOrder(key)
  console.log("deleted", key)
};
const onEdit = async key => {
  console.log("edit", key)
  purchase_order_id = parseInt(key)
  console.log("user_id", purchase_order_id)
  edit_open.value = true
  console.log("done")
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
  console.log('params', pagination, filters, sorter);
};
const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};
const handleReset = clearFilters => {
  clearFilters({
    confirm: true,
  });
  state.searchText = '';
};
</script>


