<template>
  <div class="tax-container">
    <!-- Modals -->
    <a-modal
      v-model:open="isAddModalOpen"
      title="Add Tax"
      :footer="null"
      :maskClosable="false"
    >
      <tax-add-modal @submit-success="handleSubmitSuccess"></tax-add-modal>
    </a-modal>

    <a-modal
      v-model:open="isEditModalOpen"
      title="Edit Tax"
      :footer="null"
      :maskClosable="false"
    >
      <tax-edit-modal
        @submit-success="handleSubmitSuccess"
        :tax_id="selectedTaxId"
      ></tax-edit-modal>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Taxes"
        sub-title="Manage and organize your tax rates"
      >
        <template #extra>
          <a-button
            class="add-tax-btn"
            type="primary"
            @click="handleAddTax"
            :icon="h(PlusOutlined)"
          >
            Create Tax
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

    <!-- Taxes table -->
    <div class="table-container">
      <a-table
        :dataSource="TaxStore.taxes"
        :columns="columns"
        :pagination="pagination"
        :rowKey="(record) => record.id"
        :loading="TaxStore.loading"
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
              <a-tooltip title="Edit">
                <a-button
                  type="link"
                  class="edit-btn"
                  @click="handleEditTax(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                :title="`Are you sure you want to delete this tax?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="handleDeleteTax(record.id)"
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
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="view">
                      <EyeOutlined /> View Details
                    </a-menu-item>
                    <a-menu-item key="duplicate">
                      <CopyOutlined /> Duplicate
                    </a-menu-item>
                    <a-menu-item key="archive">
                      <InboxOutlined /> Archive
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link">
                  <MoreOutlined style="font-size: 16px;" />
                </a-button>
              </a-dropdown>
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTaxStore } from "~/stores/taxStore.js";
import TaxAddModal from "~/components/taxes/taxAddModal.vue";
import TaxEditModal from "~/components/taxes/taxEditModal.vue";
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

// Initialize tax store and fetch taxes
const TaxStore = useTaxStore();
TaxStore.fetchTaxes();

// Reactive variables
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedTaxId = ref(null);
const searchInput = ref(null);

// Table columns configuration
const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
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
    title: "Rate",
    dataIndex: "rate",
    key: "rate",
    sorter: (a, b) => a.rate - b.rate,
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.rate.toString().includes(value),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    sorter: (a, b) => a.description.localeCompare(b.description),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.description.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: "Operation",
    dataIndex: "operation",
    key: "operation",
  },
];

// Pagination configuration
const pagination = ref({
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
});

// Event handlers
const handleAddTax = () => {
  isAddModalOpen.value = true;
};

const handleEditTax = (taxId) => {
  selectedTaxId.value = taxId;
  isEditModalOpen.value = true;
};

const handleDeleteTax = async (taxId) => {
  try {
    await TaxStore.deleteTax(taxId);
  } catch (error) {
    console.error("Error deleting tax:", error);
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

const onChange = (pag, filters, sorter) => {
  console.log('Table change:', pag, filters, sorter);
};

const exportToExcel = () => {
  const data = TaxStore.taxes.map(tax => ({
    Name: tax.name,
    Rate: tax.rate,
    Description: tax.description
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Taxes");
  XLSX.writeFile(wb, "taxes.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Rate', 'Description']],
    body: TaxStore.taxes.map(tax => [tax.name, tax.rate, tax.description]),
  });
  doc.save('taxes.pdf');
};
</script>

<style scoped>
.tax-container {
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

.add-tax-btn {
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
