<template>
  <div>
    <!-- Modal for adding a new unit -->
    <a-modal
      v-model:open="isAddModalOpen"
      title="Add Unit"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      cancel-text="Cancel"
    >
      <UnitsAddModal @submit-success="handleSubmitSuccess" />
      <template #footer></template>
    </a-modal>

    <!-- Modal for editing an existing unit -->
    <a-modal
      v-model:open="isEditModalOpen"
      title="Edit Unit"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      cancel-text="Cancel"
    >
      <UnitsEditModal @submit-success="handleSubmitSuccess" :unit_id="selectedUnitId" />
      <template #footer></template>
    </a-modal>
  </div>
  <a-card style="padding: 0px; margin-bottom: 10px" :bordered="false">
      <a-page-header
        style="padding: 0px"
        title="Units"
        class="units-header"
        sub-title="Manage and organize your product brands"
      >
        <template #extra>
          <a-button
            class="add-brand-btn"
            type="primary"
            @click="handleAdd"
            :icon="h(PlusOutlined)"
          >
            Create Unit
          </a-button>
        </template>
      </a-page-header>
    </a-card>
  <div theme="dark">
    <a-table
      bordered
      :data-source="unitStore.units"
      :columns="columns"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-tooltip title="Edit" placement="bottom">
            <a-button
              @click="handleEdit(record.id)"
              style="margin-right: 3px"
              :icon="h(EditOutlined)"
            />
          </a-tooltip>
          <a-popconfirm
            v-if="unitStore.units.length"
            title="Are you sure you want to delete this unit?"
            @confirm="handleDelete(record.id)"
          >
            <a-tooltip title="Delete" placement="bottom">
              <a-button :icon="h(DeleteOutlined)" />
            </a-tooltip>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUnitStore } from '~/stores/product/UnitStore.js';
import UnitsAddModal from "~/components/product/units/unitsAddModal.vue";
import UnitsEditModal from "~/components/product/units/unitsEditModal.vue";
import { DeleteOutlined, EditOutlined,PlusOutlined } from "@ant-design/icons-vue";

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
    title: 'Name',
    dataIndex: 'name',
    width: '30%',
  },
  {
    title: 'Abbreviation',
    dataIndex: 'abbreviation',
  },
  {
    title: 'Description',
    dataIndex: 'description',
  },
  {
    title: 'Operations',
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
  // This function is not used directly, but kept for potential future use
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

<style lang="less" scoped>
.editable-cell {
  position: relative;

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>