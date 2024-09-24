<template>
  <div class="div-container">
    <!-- Modals -->
    <a-modal
      v-model:open="open"
      title="Add Supplier"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <supplier-add-modal @submit-success="handleSubmitSuccess"></supplier-add-modal>
      <template #footer></template>
    </a-modal>

    <a-modal
      v-model:open="edit_open"
      title="Edit Supplier"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <supplier-edit-modal @submit-success="handleSubmitSuccess" :supplier_id="supplier_id"></supplier-edit-modal>
      <template #footer></template>
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header
        class="div-header"
        title="Suppliers"
        sub-title="Manage and organize your suppliers"
      >
        <template #extra>
          <a-button
            class="add-supplier-btn"
            type="primary"
            @click="handleAdd"
            :icon="h(PlusOutlined)"
          >
            Add New
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <!-- Suppliers table -->
    <div class="div-table-container">
      <a-table
        :dataSource="supplierStore.suppliers"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="supplierStore.loading"
        size="middle"
      >
        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'operation'">
            <a-dropdown :trigger="['click']">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="edit">
                    <a @click="onEdit(record.id)" class="edit-link">
                      <EditOutlined /> Edit
                    </a>
                  </a-menu-item>
                  <a-menu-item key="delete">
                    <a-popconfirm
                      :title="`Are you sure you want to delete this supplier: ${record.name}?`"
                      ok-text="Yes"
                      cancel-text="No"
                      @confirm="onDelete(record.id)"
                    >
                      <a class="delete-link"><DeleteOutlined /> Delete</a>
                    </a-popconfirm>
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button class="actions-btn"> Actions <DownOutlined /> </a-button>
            </a-dropdown>
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
import { ref } from 'vue';
import { DeleteOutlined, EditOutlined, PlusOutlined, DownOutlined } from "@ant-design/icons-vue";
import { useSupplierStore } from '~/stores/product/SupplierStore.js';
import SupplierAddModal from "~/components/suppliers/SupplierAddModal.vue";
import SupplierEditModal from "~/components/suppliers/SupplierEditModal.vue";

const supplierStore = useSupplierStore();
const open = ref(false);
const edit_open = ref(false);
let supplier_id = ref(null);

supplierStore.fetchSuppliers();

const columns = [
  {
    title: "Index",
    dataIndex: "index",
    sorter: (a, b) => a.index.localeCompare(b.index),
    onFilter: (value, record) =>
      record.index.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.name.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Contact',
    dataIndex: 'contact',
    sorter: (a, b) => a.contact.localeCompare(b.contact),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.contact.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    sorter: (a, b) => a.email.localeCompare(b.email),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.email.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    sorter: (a, b) => a.phone.localeCompare(b.phone),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.phone.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    sorter: (a, b) => a.status.localeCompare(b.status),
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
  },
];

const handleAdd = () => {
  open.value = true;
};

const onEdit = (id) => {
  supplier_id.value = parseInt(id);
  edit_open.value = true;
};

const onDelete = async (id) => {
  try {
    await supplierStore.deleteSupplier(id);
    console.log("Supplier deleted successfully:", id);
  } catch (error) {
    console.error("Error deleting supplier:", error);
    // TODO: Implement user-friendly error handling
  }
};

const handleOk = () => {
  open.value = false;
  edit_open.value = false;
};

const handleCancel = () => {
  open.value = false;
  edit_open.value = false;
};

const handleSubmitSuccess = () => {
  open.value = false;
  edit_open.value = false;
};
</script>

<style scoped>
.div-container {
  background-color: #f0f2f5;
  padding: 24px;
  border-radius: 8px;
}

.div-header-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.div-header {
  padding: 16px;
}

.div-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
}

.add-supplier-btn {
  font-size: 14px;
  height: 36px;
  margin-right: 8px;
}

.div-table-container {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

.actions-btn {
  background-color: #f0f0f0;
  border-color: #d9d9d9;
}

.actions-btn:hover {
  background-color: #e6e6e6;
  border-color: #d9d9d9;
}

.edit-link, .delete-link {
  color: #001529;
}

.edit-link:hover, .delete-link:hover {
  color: #ff4d4f;
}
</style>
