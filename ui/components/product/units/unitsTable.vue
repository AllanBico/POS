<template>
  <div class="div-container">
    <!-- Modals -->
    <a-modal
      v-model:open="isAddModalOpen"
      title="Add Unit"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <UnitsAddModal @submit-success="handleSubmitSuccess" />
      <template #footer></template>
    </a-modal>

    <a-modal
      v-model:open="isEditModalOpen"
      title="Edit Unit"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <UnitsEditModal @submit-success="handleSubmitSuccess" :unit_id="selectedUnitId" />
      <template #footer></template>
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header
        class="div-header"
        title="Units"
        sub-title="Manage and organize your product units"
      >
        <template #extra>
          <a-button
            class="add-unit-btn"
            type="primary"
            @click="handleAdd"
            :icon="h(PlusOutlined)"
          >
            Create Unit
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <!-- Units table -->
    <div class="div-table-container">
      <a-table
        :dataSource="unitStore.units"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="unitStore.loading"
        size="middle"
      >
        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                    type="link"
                    class="edit-btn"
                    @click="handleEdit(record.id)"
                    :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                  :title="`Are you sure you want to delete this unit: ${record.name}?`"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="handleDelete(record.id)"
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
import { useUnitStore } from '~/stores/product/UnitStore.js';
import UnitsAddModal from "~/components/product/units/unitsAddModal.vue";
import UnitsEditModal from "~/components/product/units/unitsEditModal.vue";
import { DeleteOutlined, EditOutlined, PlusOutlined, DownOutlined } from "@ant-design/icons-vue";

// State management
const unitStore = useUnitStore();
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedUnitId = ref(null);

// Fetch units on component mount
unitStore.fetchUnits();

// Table columns configuration
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
    title: 'Abbreviation',
    dataIndex: 'abbreviation',
    sorter: (a, b) => a.abbreviation.localeCompare(b.abbreviation),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.abbreviation.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    sorter: (a, b) => a.description.localeCompare(b.description),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.description.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
  },
];

// Event handlers
const handleAdd = () => {
  isAddModalOpen.value = true;
};

const handleEdit = (id) => {
  selectedUnitId.value = parseInt(id);
  isEditModalOpen.value = true;
};

const handleDelete = async (id) => {
  try {
    await unitStore.deleteUnit(id);
    console.log("Unit deleted successfully:", id);
  } catch (error) {
    console.error("Error deleting unit:", error);
    // TODO: Implement user-friendly error handling (e.g., show error message to user)
  }
};

const handleModalOk = () => {
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
};

const handleModalCancel = () => {
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
};

const handleSubmitSuccess = () => {
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
  // TODO: Consider refreshing the units list or showing a success message
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

.add-unit-btn {
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