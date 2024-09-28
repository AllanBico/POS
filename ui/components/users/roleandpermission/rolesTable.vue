<template>
  <div class="role-container">
    <!-- Modals -->
    <a-modal
      v-model:open="isAddModalOpen"
      title="Create Role"
      :footer="null"
      :maskClosable="false"
    >
      <role-add-modal @submit-success="handleSubmitSuccess"></role-add-modal>
    </a-modal>

    <a-modal
      v-model:open="isEditModalOpen"
      title="Edit Role"
      :footer="null"
      :maskClosable="false"
    >
      <role-edit-modal
        @submit-success="handleSubmitSuccess"
        :role_id="selectedRoleId"
      ></role-edit-modal>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Roles"
        sub-title="Manage and organize user roles"
      >
        <template #extra>
          <a-button
            class="add-role-btn"
            type="primary"
            @click="handleAddRole"
            :icon="h(PlusOutlined)"
          >
            Create Role
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

    <!-- Roles table -->
    <div class="table-container">
      <a-table
        :dataSource="roleStore.roles"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="roleStore.loading"
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
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="View">
                <a-button
                  type="link"
                  class="view-btn"
                  @click="onView(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="Edit">
                <a-button
                  type="link"
                  class="edit-btn"
                  @click="handleEditRole(record.id)"
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
import { useRoleStore } from '~/stores/RoleStore.js';
import { useTabsStore } from "~/stores/tabsStore.js";
import roleAddModal from "~/components/users/roleandpermission/roleAddModal.vue";
import roleEditModal from "~/components/users/roleandpermission/roleEditModal.vue";
import rolePermissions from "~/components/users/roleandpermission/rolePermissions.vue";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons-vue";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const tabsStore = useTabsStore();
const roleStore = useRoleStore();
roleStore.fetchRoles();
roleStore.fetchPermissions();
console.log("roleStore",roleStore.roles)
console.log("roleStore",roleStore.permissions)
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedRoleId = ref(null);
const searchInput = ref(null);

const columns = [
  {
    title: 'Role Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.name.toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value?.focus();
        }, 100);
      }
    },
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
  },
];

const handleAddRole = () => {
  isAddModalOpen.value = true;
};

const handleEditRole = (roleId) => {
  selectedRoleId.value = roleId;
  isEditModalOpen.value = true;
};

const onDelete = async (roleId) => {
  try {
    await roleStore.deleteRole(roleId);
  } catch (error) {
    console.error("Error deleting role:", error);
  }
};

const handleSubmitSuccess = () => {
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
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

const onView = async (roleId) => {
  tabsStore.addTab('Permissions', rolePermissions, { roleId: roleId });
};

const exportToExcel = () => {
  const data = roleStore.roles.map(role => ({
    Name: role.name,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Roles");
  XLSX.writeFile(wb, "roles.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name']],
    body: roleStore.roles.map(role => [role.name]),
  });
  doc.save('roles.pdf');
};
</script>

<style scoped>
.role-container {
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

.add-role-btn {
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
