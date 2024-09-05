<template>
  <div>
    <a-modal v-model:open="open" title="Add Customer" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <customer-add-modal @submit-success="handleSubmitSuccess"></customer-add-modal>
      <template #footer>
      </template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit User" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <customer-edit-modal @submit-success="handleSubmitSuccess" :customer_id="customer_id"></customer-edit-modal>
      <template #footer>
      </template>
    </a-modal>
  </div>
  <div>
  </div>
  <div class="coupons-container">
    <a-card title="Categories" bordered={false}>
      <div class="header-controls">


        <div class="actions">
          <a-button type="primary" @click="handleAdd" :icon="h(PlusOutlined)">Add New</a-button>

        </div>
      </div>

      <a-table
          :columns="columns"
          :data-source="customerStore.customers"
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
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-popconfirm
                v-if="customerStore.customers.length"
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
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons-vue";
import {useCustomerStore} from '~/stores/customer.js';
import CustomerAddModal from "~/components/customers/customerAddModal.vue";
import CustomerEditModal from "~/components/customers/customerEditModal.vue";

const customerStore = useCustomerStore();
const open = ref(false);
const edit_open = ref(false);
let customer_id = ref(null)
customerStore.fetchCustomers()
console.log("customerStore.customers", customerStore.customers)
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
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
  }
  ,
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
  }
  ,
  {
    title: 'city',
    dataIndex: 'city',
    key: 'city',
    sorter: (a, b) => a.city.localeCompare(b.city),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.city.toString().toLowerCase().includes(value.toLowerCase()),
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
    title: 'country',
    dataIndex: 'country',
    key: 'country',
    sorter: (a, b) => a.country.localeCompare(b.country),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.country.toString().toLowerCase().includes(value.toLowerCase()),
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
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    sorter: (a, b) => a.description.localeCompare(b.description),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.description.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
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
  await customerStore.deleteCustomer(key)
  console.log("deleted", key)
};
const onEdit = async key => {
  console.log("edit", key)
  customer_id = parseInt(key)
  console.log("user_id", customer_id)
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
