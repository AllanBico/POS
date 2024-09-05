<template>
  <div>
    <a-modal v-model:open="open" title="Add Supplier" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <supplier-add-modal @submit-success="handleSubmitSuccess"></supplier-add-modal>
      <template #footer>
      </template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit User" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <Supplier-edit-modal @submit-success="handleSubmitSuccess" :supplier_id="supplier_id"></Supplier-edit-modal>
      <template #footer>
      </template>
    </a-modal>
  </div>
  <div>
  </div>
  <div class="coupons-container">
    <a-card  bordered={false}>
      <div class="header-controls">
        <a-input-search
            placeholder="Search"
            style="width: 200px;"
        />

        <div class="actions">
          <a-button type="primary" @click="handleAdd" :icon="h(PlusOutlined)">Add New</a-button>

        </div>
      </div>

      <a-table
          :columns="columns"
          :data-source="supplierStore.suppliers"
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
          <template v-if="column.dataIndex === 'status'">
        <span>
          <a-tag
              :key="record.id"
              :color="record.status ? 'success' : 'error'"
          >
          {{ record.status ? 'Active' : 'Inactive' }} {{record.status}}
        </a-tag>

        </span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-popconfirm
                v-if="supplierStore.suppliers.length"
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
import {cloneDeep} from 'lodash-es';

import SupplierAddModal from "~/components/Suppliers/SupplierAddModal.vue";
import SupplierEditModal from "~/components/Suppliers/SupplierEditModal.vue";
import {DeleteOutlined, EditOutlined,PlusOutlined} from "@ant-design/icons-vue";
import { useSupplierStore } from '~/stores/supplier.js';

const supplierStore = useSupplierStore();
const open = ref(false);
const edit_open = ref(false);
let supplier_id = ref(null)
supplierStore.fetchSuppliers()
console.log("supplierStore.suppliers", supplierStore.suppliers)
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '30%',
    sorter: (a, b) => a.name.localeCompare(b.name),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.name.toString().toLowerCase().includes(value.toLowerCase()),
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
    title: 'Contact',
    dataIndex: 'contact',
    key: 'contact',
    sorter: (a, b) => a.contact.localeCompare(b.contact),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.contact.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: 'email',
    dataIndex: 'email',
    key: 'email',
    sorter: (a, b) => a.email.localeCompare(b.email),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.email.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: 'phone',
    dataIndex: 'phone',
    key: 'phone',
    sorter: (a, b) => a.phone.localeCompare(b.phone),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.phone.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: 'status',
    dataIndex: 'status',
    key: 'status',
    sorter: (a, b) => a.status.localeCompare(b.status),
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const pagination = ref({pageSize: 10});
const edit = key => {
};
const save = key => {
};
const onDelete = async key => {
  await supplierStore.deleteSupplier(key)
  console.log("deleted", key)
};
const onEdit = async key => {
  console.log("edit", key)
  supplier_id = parseInt(key)
  console.log("user_id", supplier_id)
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

<style scoped>
.coupons-container {
  padding: 20px;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  align-items: end;
}

.actions a-button {
  margin-left: 2px;
}
</style>
