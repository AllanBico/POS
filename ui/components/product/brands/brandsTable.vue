<template>
  <div class="brands-container">
    <!-- Modals -->
    <a-modal
      v-model:open="isAddModalOpen"
      title="Create Brand"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <brand-add-modal @submit-success="handleSubmitSuccess"></brand-add-modal>
      <template #footer> </template>
    </a-modal>

    <a-modal
      v-model:open="isEditModalOpen"
      title="Edit Brand"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <brand-edit-modal
        @submit-success="handleSubmitSuccess"
        :selectedBrandId="selectedBrandId"
      ></brand-edit-modal>
      <template #footer> </template>
    </a-modal>

    <!-- Header -->
    <a-card style="padding: 0px; margin-bottom: 10px" :bordered="false">
      <a-page-header
        style="padding: 0px"
        title="Brands"
        class="brands-header"
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
                  <FileExcelOutlined /> Export to Excel
                </a-menu-item>
                <a-menu-item key="2" @click="exportToPDF">
                  <FilePdfOutlined /> Export to PDF
                </a-menu-item>
              </a-menu>
            </template>
            <a-button>
              Export <DownOutlined />
            </a-button>
          </a-dropdown>
        </template>
      </a-page-header>
    </a-card>

    <!-- Brands table -->
    <div style="padding: 10px; background-color: #fff">
      <a-table
        :dataSource="brandStore.brands"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="loading"
        size="small"
        @change="handleTableChange"
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
          <div style="padding: 8px">
            <a-input
              ref="searchInput"
              :placeholder="`Search ${column.title}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="
                (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
              "
              @pressEnter="
                handleSearch(selectedKeys, confirm, column.dataIndex)
              "
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
            <a-button
              size="small"
              style="width: 90px"
              @click="handleReset(clearFilters)"
            >
              Reset
            </a-button>
          </div>
        </template>

        <!-- Custom filter icon -->
        <template #customFilterIcon="{ filtered }">
          <search-outlined
            :style="{ color: filtered ? '#1890ff' : undefined }"
          />
        </template>

        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'operation'">
            <a-dropdown :trigger="['click']">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="edit">
                    <a @click="handleEditBrand(record.id)">
                      <EditOutlined /> Edit
                    </a>
                  </a-menu-item>
                  <a-menu-item key="delete">
                    <a-popconfirm
                      :title="`Are you sure you want to delete this brand: ${record.name}?`"
                      ok-text="Yes"
                      cancel-text="No"
                      @confirm="handleDeleteBrand(record.id)"
                    >
                      <a><DeleteOutlined /> Delete</a>
                    </a-popconfirm>
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button> Actions <DownOutlined /> </a-button>
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
} from "@ant-design/icons-vue";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Initialize brand store and fetch brands
const brandStore = useBrandStore();
brandStore.fetchBrands();

// Reactive variables
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedBrandId = ref(null);
const searchInput = ref(null);

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
  console.log("brandId", brandId);
  console.log("selectedBrandId", selectedBrandId.value);
};

const handleDeleteBrand = async (brandId) => {
  try {
    await brandStore.deleteBrand(brandId);
    console.log("Brand deleted successfully:", brandId);
  } catch (error) {
    console.error("Error deleting brand:", error);
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
