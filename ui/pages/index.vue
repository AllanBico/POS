<template>

  <div>
    <!-- Header with Search and Actions -->
    <div class="header">
      <h2>User List</h2>
      <p>Manage Your Users</p>
      <a-input-search
          placeholder="Search"
          style="width: 200px; margin-bottom: 16px;"
          v-model:value="searchValue"
          @search="onSearch"
      />
      <div class="actions">
        <!-- Actions like Add New User, Sort, etc. -->
        <a-button type="primary" @click="addNewUser">Add New User</a-button>
      </div>
    </div>

    <!-- User List Table -->
    <a-table
        :columns="columns"
        :data-source="filteredData"
        row-key="email"
        :pagination="{ pageSize: 10 }"
    >
      <!-- Custom Render for Status -->
      <template #status="{ text, record }">
        <a-badge
            :status="record.status === 'Active' ? 'success' : 'error'"
            :text="record.status"
        />
      </template>

      <!-- Custom Render for Actions -->
      <template #action="{ record }">
        <a-button-group>
          <a-button @click="viewUser(record)">View</a-button>
          <a-button @click="editUser(record)">Edit</a-button>
          <a-button type="danger" @click="deleteUser(record)">Delete</a-button>
        </a-button-group>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { message, Badge, Button, Input, Table } from 'ant-design-vue';

// Sample Data for Users
const users = ref([
  {
    key: '1',
    avatar: 'path/to/avatar1.jpg',
    name: 'Thomas',
    phone: '+12163547758',
    email: 'thomas@example.com',
    role: 'Admin',
    createdOn: '19 Jan 2023',
    status: 'Inactive',
  },
  {
    key: '2',
    avatar: 'path/to/avatar2.jpg',
    name: 'Rose',
    phone: '+11367529510',
    email: 'rose@example.com',
    role: 'Manager',
    createdOn: '23 Jan 2023',
    status: 'Active',
  },
  // ...more user data
]);

const searchValue = ref('');
const filteredData = computed(() => {
  if (!searchValue.value) return users.value;
  return users.value.filter(user =>
      Object.values(user).some(val =>
          String(val).toLowerCase().includes(searchValue.value.toLowerCase())
      )
  );
});

const columns = [
  {
    title: 'User Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    scopedSlots: { customRender: 'name' },
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    sorter: (a, b) => a.role.localeCompare(b.role),
  },
  {
    title: 'Created On',
    dataIndex: 'createdOn',
    key: 'createdOn',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: 'Action',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];

const onSearch = (value) => {
  console.log('Search:', value);
};

const addNewUser = () => {
  message.success('Add new user clicked');
};

const viewUser = (record) => {
  message.info(`View user: ${record.name}`);
};

const editUser = (record) => {
  message.info(`Edit user: ${record.name}`);
};

const deleteUser = (record) => {
  message.error(`Delete user: ${record.name}`);
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions .ant-btn {
  margin-right: 8px;
}

.ant-table-thead > tr > th {
  background-color: #f5f5f5;
}

.ant-table-tbody > tr > td {
  vertical-align: middle;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.badge-active {
  color: green;
}

.badge-inactive {
  color: red;
}
</style>
