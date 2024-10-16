<template>
  <div class="brand-container">
    <!-- Modals -->
    <a-modal
        v-model:open="isAddModalOpen"
        :footer="null"
        :maskClosable="false"
    >
      <brand-add-modal @submit-success="handleSubmitSuccess"></brand-add-modal>
    </a-modal>

    <a-modal
        v-model:open="isEditModalOpen"
        :footer="null"
        :maskClosable="false"
    >
      <brand-edit-modal
          @submit-success="handleSubmitSuccess"
          :selectedBrandId="selectedBrandId"
      ></brand-edit-modal>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
          class="header"
          style="padding: 0%;"
          title="Brands"
          sub-title="Manage and organize your product brands"
      >
        <template #extra>
          <a-button
              class="add-brand-btn"
              type="primary"
              @click="handleAddBrand"
              :icon="h(PlusOutlined)"
          >
            Create Brand
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

    <!-- Brands table -->
    <div class="table-container">
      <a-table
          :dataSource="brandStore.brands"
          :columns="columns"
          :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
          :rowKey="(record) => record.id"
          :loading="brandStore.loading"
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
          <search-outlined :class="{ 'text-primary': filtered }" />
        </template>

        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                    type="link"
                    class="edit-btn"
                    @click="handleEditBrand(record.id)"
                    :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                  :title="`Are you sure you want to delete ${record.name}?`"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="handleDeleteBrand(record.id)"
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
import { ref } from "vue";
import { useBrandStore } from "~/stores/product/BrandStore.js";
import BrandAddModal from "~/components/product/brands/brandAddModal.vue";
import BrandEditModal from "~/components/product/brands/brandEditModal.vue";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EyeOutlined,
  CopyOutlined,
  InboxOutlined,
  MoreOutlined,
} from "@ant-design/icons-vue";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Initialize brand store and fetch brands
const brandStore = useBrandStore();


// Reactive variables
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedBrandId = ref(null);
const searchInput = ref(null);

// Table columns configuration
const columns = [

  {
    title: "Name",
    dataIndex: "name",
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
    title: "Description",
    dataIndex: "description",
    sorter: (a, b) => a.description.localeCompare(b.description),
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.description.toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value?.focus();
        }, 100);
      }
    },
  },
  {
    title: "Operation",
    dataIndex: "operation",
  },
];

// Event handlers
const handleAddBrand = () => {
  isAddModalOpen.value = true;
};

const handleEditBrand = (brandId) => {
  selectedBrandId.value = brandId;
  isEditModalOpen.value = true;
};

const handleDeleteBrand = async (brandId) => {
  try {
    await brandStore.deleteBrand(brandId);
  } catch (error) {
    console.error("Error deleting brand:", error);
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
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
};

const exportToExcel = () => {
  const data = brandStore.brands.map(brand => ({
    Name: brand.name,
    Description: brand.description
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Brands");
  XLSX.writeFile(wb, "brands.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Description']],
    body: brandStore.brands.map(brand => [brand.name, brand.description]),
  });
  doc.save('brands.pdf');
};
</script>

<style scoped>
.brand-container {
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

.add-brand-btn {
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