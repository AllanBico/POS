<template>
  <div class="div-container">
    <!-- Modals -->
    <a-modal v-model:open="open"  @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
      cancel-text="Cancel" :maskClosable="false">
      <supplier-add-modal @submit-success="handleSubmitSuccess"></supplier-add-modal>
      <template #footer></template>
    </a-modal>

    <a-modal v-model:open="edit_open"  @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
      cancel-text="Cancel" :maskClosable="false">
      <supplier-edit-modal @submit-success="handleSubmitSuccess" :supplier_id="supplier_id"></supplier-edit-modal>
      <template #footer></template>
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header class="div-header" title="Suppliers" style="padding: 0%;" sub-title="Manage and organize your suppliers">
        <template #extra>
          <a-button class="add-supplier-btn" type="primary" @click="handleAdd" :icon="h(PlusOutlined)">
            Add New
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
              Export
              <DownOutlined />
            </a-button>
          </a-dropdown>
        </template>
      </a-page-header>
    </a-card>

    <!-- Suppliers table -->
    <div class="div-table-container">
      <a-table :dataSource="supplierStore.suppliers" :columns="columns"  :rowKey="(record) => record.id" :loading="supplierStore.loading" size="middle" @change="handleTableChange"
        :scroll="{ x: 'max-content' }" :rowClassName="(record, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')">
        <!-- Custom filter dropdown template -->
        <template #customFilterDropdown="{
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          column,
        }">
          <div class="custom-filter-dropdown">
            <a-input ref="searchInput" :placeholder="`Search ${column.title}`" :value="selectedKeys[0]" @change="(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
              " @pressEnter="
                handleSearch(selectedKeys, confirm, column.dataIndex)
                " />
            <a-button type="primary" @click="handleSearch(selectedKeys, confirm, column.dataIndex)">
              <template #icon>
                <SearchOutlined />
              </template>
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
                <a-button type="link" class="edit-btn" @click="onEdit(record.id)" :style="{ color: '#1890ff' }">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-popconfirm :title="`Are you sure you want to delete this supplier: ${record.name}?`" ok-text="Yes"
                cancel-text="No" @confirm="onDelete(record.id)" placement="bottom">
                <a-tooltip title="Delete">
                  <a-button type="link" class="delete-btn" :style="{ color: '#ff4d4f' }">
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <span>
              <a-tag :key="record.id" :color="record.status === 'true' ? 'success' : 'error'">
                {{ record.status === 'true' ? 'Active' : 'Inactive' }}
              </a-tag>
            </span>
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
import { DeleteOutlined, EditOutlined, PlusOutlined, DownOutlined, SearchOutlined, FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons-vue";
import { useSupplierStore } from '~/stores/product/SupplierStore.js';
import SupplierAddModal from "~/components/suppliers/supplierAddModal.vue";
import SupplierEditModal from "~/components/suppliers/supplierEditModal.vue";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuthStore } from "~/stores/AuthStore.js";

const authStore = useAuthStore(); // Initialize AuthStore
const supplierStore = useSupplierStore(); // Initialize category store
supplierStore.fetchSuppliers()
// Reactive variables
const open = ref(false);
const edit_open = ref(false);
let supplier_id = ref(null);
const searchInput = ref(null);

// Computed properties for permission checks
const canCreateSupplier = computed(() => authStore.hasPermission('supplier', 'create'));
const canUpdateSupplier = computed(() => authStore.hasPermission('supplier', 'update'));
const canDeleteSupplier = computed(() => authStore.hasPermission('supplier', 'delete'));

// Table columns configuration
const columns = [

  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.name.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Contact',
    dataIndex: 'contact',
    sorter: (a, b) => a.contact.localeCompare(b.contact),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.contact.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    sorter: (a, b) => a.email.localeCompare(b.email),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.email.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    sorter: (a, b) => a.phone.localeCompare(b.phone),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.phone.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    sorter: (a, b) => a.status.localeCompare(b.status),
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    // Only render this column if there are permissions to update or delete
    render: () => (canUpdateSupplier.value || canDeleteSupplier.value),
  },
];

// Event handlers
const handleAdd = () => {
  open.value = true;
};

const onEdit = (id) => {
  supplier_id.value = parseInt(id);
  edit_open.value = true;
};

const onDelete = async (id) => {
  try {
    await supplierStore.deleteSupplier(id);
    console.log("Supplier deleted successfully:", id);
  } catch (error) {
    console.error("Error deleting supplier:", error);
    // TODO: Implement user-friendly error handling
  }
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
  const filteredData = supplierStore.suppliers.filter(supplier => {
    // Check if the supplier matches the filters
    let matches = true;
    if (filters) { // Check if filters is not null
      for (const key in filters) {
        if (filters[key] && filters[key].length > 0 && !filters[key].includes(supplier[key])) {
          matches = false;
          break;
        }
      }
    }
    return matches;
  });
  console.log('filteredData', filteredData)
  exportToExcel(filteredData);
  exportToPDF(filteredData);
};

const exportToExcel = (data) => {
  console.log('export data', data)
  if (Array.isArray(data)) {
    const ws = XLSX.utils.json_to_sheet(data.map(supplier => ({
      Name: supplier.name,
      Contact: supplier.contact,
      Email: supplier.email,
      Phone: supplier.phone,
      Status: supplier.status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
    XLSX.writeFile(wb, "suppliers.xlsx");
  } else {
    console.error("Error exporting to Excel: Data is not an array.");
  }
};

const exportToPDF = (data) => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Contact', 'Email', 'Phone', 'Status']],
    body: data.map(supplier => [supplier.name, supplier.contact, supplier.email, supplier.phone, supplier.status]),
  });
  doc.save('suppliers.pdf');
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.div-header {
  padding: 16px;
}

.div-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
}

.add-supplier-btn {
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

.edit-link,
.delete-link {
  color: #001529;
}

.edit-link:hover,
.delete-link:hover {
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
