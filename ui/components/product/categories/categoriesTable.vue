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
      <category-add-modal @submit-success="handleSubmitSuccess"></category-add-modal>
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
      <category-edit-modal
        @submit-success="handleSubmitSuccess"
        :category_id="selectedCategoryId"></category-edit-modal>
      <template #footer> </template>
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false" >
      <a-page-header
        class="div-header"
        style="padding: 0%;"
        title="Categories"
        sub-title="Manage and organize your product categories"
      >
        <template #extra>
          <a-button
            v-if="canCreateCategory"
            class="add-category-btn"
            type="primary"
            @click="handleAddCategory"
            :icon="h(PlusOutlined)"
          >
            Create Category
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

    <!-- Categories table -->
    <div class="div-table-container">
      <a-table
        :dataSource="categoryStore.categories"
        :columns="columns"

        :rowKey="(record) => record.id"
        :loading="categoryStore.loading"
        size="middle"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
        :rowClassName="(record, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')"
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
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'operation' && (canUpdateCategory || canDeleteCategory)">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                  v-if="canUpdateCategory"
                  type="link"
                  class="edit-btn"
                  @click="handleEditCategory(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                v-if="canDeleteCategory"
                :title="`Are you sure you want to delete ${record.name}?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="handleDeleteCategory(record.id)"
                placement="bottom"
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
import { ref, computed } from "vue";
import { useCategoryStore } from "~/stores/product/CategoryStore.js";
import CategoryAddModal from "~/components/product/categories/categoryAddModal.vue";
import CategoryEditModal from "~/components/product/categories/categoryEditModal.vue";
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
import { useAuthStore } from "~/stores/AuthStore.js";

const authStore = useAuthStore(); // Initialize AuthStore
const categoryStore = useCategoryStore(); // Initialize category store

// Reactive variables
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedCategoryId = ref(null);
const searchInput = ref(null);

// Computed properties for permission checks
const canCreateCategory = computed(() => authStore.hasPermission('category', 'create'));
const canUpdateCategory = computed(() => authStore.hasPermission('category', 'update'));
const canDeleteCategory = computed(() => authStore.hasPermission('category', 'delete'));

// Table columns configuration
const columns = [

  {
    title: "Name",
    dataIndex: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.name.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: "Description",
    dataIndex: "description",
    sorter: (a, b) => a.description.localeCompare(b.description),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.description.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: "Operation",
    dataIndex: "operation",
    // Only render this column if there are permissions to update or delete
    render: () => (canUpdateCategory.value || canDeleteCategory.value),
  },
];

// Event handlers
const handleAddCategory = () => {
  isAddModalOpen.value = true;
};

const handleEditCategory = (categoryId) => {
  selectedCategoryId.value = categoryId;
  isEditModalOpen.value = true;
};

const handleDeleteCategory = async (categoryId) => {
  try {
    await categoryStore.deleteCategory(categoryId);
    console.log("Category deleted successfully:", categoryId);
  } catch (error) {
    console.error("Error deleting category:", error);
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
  console.log('Table changed:', pagination, filters, sorter);
  // TODO: Implement table change logic if needed
  const filteredData = categoryStore.categories.filter(category => {
    // Check if the category matches the filters
    let matches = true;
    if (filters) { // Check if filters is not null
      for (const key in filters) {
        if (filters[key] && filters[key].length > 0 && !filters[key].includes(category[key])) {
          matches = false;
          break;
        }
      }
    }
    return matches;
  });
  console.log('filteredData',filteredData)
  exportToExcel(filteredData);
  exportToPDF(filteredData);
};

const exportToExcel = (data) => {
  console.log('export data',data)
  if (Array.isArray(data)) {
    const ws = XLSX.utils.json_to_sheet(data.map(category => ({
      Name: category.name,
      Description: category.description
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");
    XLSX.writeFile(wb, "categories.xlsx");
  } else {
    console.error("Error exporting to Excel: Data is not an array.");
  }
};

const exportToPDF = (data) => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Description']],
    body: data.map(category => [category.name, category.description]),
  });
  doc.save('categories.pdf');
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

.add-category-btn {
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

.text-primary {
  color: #1890ff;
}

.even-row {
  background-color: #f9f9f9;
}

.odd-row {
  background-color: #ffffff;
}
</style>
