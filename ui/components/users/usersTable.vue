<template>
  <div class="user-container">
    <!-- Modals -->
    <a-modal
      v-model:open="open"
      title="Add User"
      :footer="null"
      :maskClosable="false"
    >
      <user-add-modal @submit-success="handleSubmitSuccess"></user-add-modal>
    </a-modal>

    <a-modal
      v-model:open="edit_open"
      title="Edit User"
      :footer="null"
      :maskClosable="false"
    >
      <UserEditModal
        :user_id="user_id"
        @submit-success="handleSubmitSuccess"
      ></UserEditModal>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Users"
        sub-title="Manage and organize your system users"
      >
        <template #extra>
          <a-button
            class="add-user-btn"
            type="primary"
            @click="handleAdd"
            :icon="h(PlusOutlined)"
          >
            Add User
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

    <!-- Users table -->
    <div class="table-container">
      <a-table
        :dataSource="userStore.users"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="userStore.loading"
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
              <a-popconfirm
                :title="`Are you sure you want to delete ${record.name}?`"
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
import UserAddModal from "~/components/users/userAddModal.vue";
import UserEditModal from "~/components/users/userEditModal.vue";
import { useUserStore } from '~/stores/UserStore.js';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons-vue";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const userStore = useUserStore();
userStore.fetchUsers();

const open = ref(false);
const edit_open = ref(false);
const user_id = ref(null);
const searchInput = ref(null);

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    customFilterDropdown: true,
    onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    sorter: (a, b) => a.email.localeCompare(b.email),
    customFilterDropdown: true,
    onFilter: (value, record) => record.email.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Created',
    dataIndex: 'created_at',
    sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
  },
];

const onDelete = async (key) => {
  await userStore.deleteUser(key);
};

const onEdit = async (key) => {
  user_id.value = parseInt(key);
  edit_open.value = true;
};

const handleAdd = () => {
  open.value = true;
};

const handleSubmitSuccess = () => {
  open.value = false;
  edit_open.value = false;
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
};

const onChange = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};

const exportToExcel = () => {
  const data = userStore.users.map(user => ({
    Name: user.name,
    Email: user.email,
    Created: user.created_at
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");
  XLSX.writeFile(wb, "users.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Email', 'Created']],
    body: userStore.users.map(user => [user.name, user.email, user.created_at]),
  });
  doc.save('users.pdf');
};
</script>

<style lang="less" scoped>
.user-container {
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

.header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
}

.add-user-btn {
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