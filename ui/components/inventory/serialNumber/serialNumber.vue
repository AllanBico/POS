<template>
    <div>
  
      <!-- Serial Numbers Table -->
      <a-table
        :columns="columns"
        :data-source="serialNumberStore.serialNumbers"
        :pagination="pagination"
        :loading="serialNumberStore.loading"
        :rowKey="record => record.id"
        bordered
        size="small"
        @change="onTableChange"
      >
        <!-- Search Filter Template -->
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
        <!-- Filter Icon -->
        <template #customFilterIcon="{ filtered }">
          <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
        </template>
  
        <!-- Operation Column -->
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)" />
            </a-tooltip>
            <a-popconfirm title="Sure to delete?" @confirm="onDelete(record.id)">
              <a-tooltip title="Delete" placement="bottom">
                <a-button :icon="h(DeleteOutlined)" />
              </a-tooltip>
            </a-popconfirm>
          </template>
        </template>
      </a-table>

  
      <a-modal v-model:open="edit_open" title="Edit Serial Number" @ok="handleOk" @cancel="handleCancel">
        <serial-number-edit-modal @submit-success="handleSubmitSuccess" :serial_id="serial_id"></serial-number-edit-modal>
      </a-modal>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useSerialNumberStore } from '~/stores/SerialNumberStore.js';
  import SerialNumberEditModal from '~/components/inventory/serialNumber/SerialNumberEditModal.vue';
  import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons-vue';
  
  // Store setup
  const serialNumberStore = useSerialNumberStore();
  serialNumberStore.fetchSerialNumbers();
  console.log("serialNumberStore.serialNumbers", serialNumberStore.serialNumbers);
  // Modals and serial number state
  const open = ref(false);
  const edit_open = ref(false);
  let serial_id = ref(null);
  
  // Table columns configuration
  const columns = [
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      sorter: (a, b) => a.serialNumber.localeCompare(b.serialNumber),
      sortDirections: ['descend', 'ascend'],
      customFilterDropdown: true,
    },
    {
      title: 'Date Added',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortDirections: ['descend', 'ascend'],
      customFilterDropdown: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortDirections: ['descend', 'ascend'],
      customFilterDropdown: true,
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
    },
  ];
  
  // Pagination config
  const pagination = ref({ pageSize: 10 });
  
  // Table events
  const onTableChange = (pagination, filters, sorter) => {
    console.log('Table change params:', pagination, filters, sorter);
  };
  
  // Add/Edit/Delete Handlers
  const handleAdd = () => {
    open.value = true;
  };
  
  const onEdit = (id) => {
    serial_id.value = id;
    edit_open.value = true;
  };
  
  const onDelete = async (id) => {
    await serialNumberStore.deleteSerialNumber(id);
    console.log('Deleted serial number:', id);
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
  
  // Search and Reset Handlers
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    console.log('Searching for:', selectedKeys[0]);
  };
  
  const handleReset = (clearFilters) => {
    clearFilters();
    console.log('Filters reset');
  };
  </script>
  
  <style scoped>
  .header-controls {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
  
  .a-button {
    margin-right: 10px;
  }
  </style>
  