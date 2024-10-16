<template>
  <div class="div-container">
    <!-- Modals -->
    <a-modal
      v-model:open="isAddModalOpen"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <attribute-value-add-modal 
        :attribute_id="attribute_id"
        @submit-success="handleSubmitSuccess"
      ></attribute-value-add-modal>
      <template #footer> </template>
    </a-modal>

    <a-modal
      v-model:open="isEditModalOpen"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <attribute-value-edit-modal
        @submit-success="handleSubmitSuccess"
        :attribute_value_id="selectedAttributeValueId"
      ></attribute-value-edit-modal>
      <template #footer> </template>
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header
        class="div-header"
        :title="`${attribute?.name} Attribute Values`"
        :sub-title="`Manage and organize your attribute values`"
        style="padding: 0%;"
      >
        <template #extra>
          <a-button
            class="add-attribute-value-btn"
            type="primary"
            @click="handleAddAttributeValue"
            :icon="h(PlusOutlined)"
          >
            Create Attribute Value
          </a-button>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="exportToExcel">
                  <FileExcelOutlined />  Excel
                </a-menu-item>
                <a-menu-item key="2" @click="exportToPDF">
                  <FilePdfOutlined />  PDF
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

    <!-- Attribute Values table -->
    <div class="div-table-container">
      <a-table
        :dataSource="values"
        :columns="columns"
        :pagination="pagination"
        :rowKey="(record) => record.id"
        :loading="attributesStore.loading"
        size="middle"
        @change="handleTableChange"
        bordered
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
          <search-outlined
            :class="{ 'text-primary': filtered }"
          />
        </template>

        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                  type="link"
                  class="edit-btn"
                  @click="handleEditAttributeValue(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                :title="`Are you sure you want to delete ${record.value}?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="handleDeleteAttributeValue(record.id)"
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
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAttributesStore } from '~/stores/product/AttributeStore.js';
import AttributeValueAddModal from "~/components/product/attributes/attributeValueAddModal.vue";
import AttributeValueEditModal from "~/components/product/attributes/attributeValueEditModal.vue";
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

const attributesStore = useAttributesStore();
const route = useRoute();

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

// Reactive variables
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedAttributeValueId = ref(null);
const searchInput = ref(null);
const attribute_id = ref(props.id);

// Fetch attribute values
attributesStore.fetchAttributeValues();

// Computed values
const values = computed(() => attributesStore.ValuesByAttributeId(parseInt(props.id)));
const attribute = computed(() => attributesStore.AttributeById(parseInt(props.id)));

// Watch for changes in props.id
watch(() => props.id, (newAttributeId) => {
  attribute_id.value = newAttributeId;
}, { immediate: true });

// Table columns configuration
const columns = [
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
    sorter: (a, b) => a.value.localeCompare(b.value),
    customFilterDropdown: true,
    onFilter: (value, record) => record.value.toLowerCase().includes(value.toLowerCase()),
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
    key: 'operation',
  },
];

const pagination = ref({
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
});

// Event handlers
const handleAddAttributeValue = () => {
  isAddModalOpen.value = true;
};

const handleEditAttributeValue = (attributeValueId) => {
  selectedAttributeValueId.value = attributeValueId;
  isEditModalOpen.value = true;
};

const handleDeleteAttributeValue = async (attributeValueId) => {
  try {
    await attributesStore.deleteAttributeValue(attributeValueId);
    console.log("Attribute value deleted successfully:", attributeValueId);
  } catch (error) {
    console.error("Error deleting attribute value:", error);
    // TODO: Implement user-friendly error handling
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
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  // TODO: Implement search functionality
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
  // TODO: Reset search state
};

const handleTableChange = (pagination, filters, sorter) => {
  console.log('Table params', pagination, filters, sorter);
  // TODO: Handle table change if needed
};

const exportToExcel = () => {
  const data = values.value.map(attributeValue => ({
    Value: attributeValue.value,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attribute Values");
  XLSX.writeFile(wb, "attribute_values.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Value']],
    body: values.value.map(attributeValue => [attributeValue.value]),
  });
  doc.save('attribute_values.pdf');
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

.add-attribute-value-btn {
  font-size: 14px;
  height: 36px;
  margin-right: 8px;
}

.export-btn {
  height: 36px;
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
}

.custom-filter-dropdown button {
  width: 100px;
  margin-right: 8px;
}

.text-primary {
  color: #1890ff;
}
</style>
