<template>
  <div class="inventory-container">
    <!-- Modals -->
    <a-modal
      v-model:open="open"
      title="Add Inventory"
      :footer="null"
      :maskClosable="false"
    >
      <attribute-add-modal @submit-success="handleSubmitSuccess"></attribute-add-modal>
    </a-modal>

    <a-modal
      v-model:open="edit_open"
      title="Edit Inventory"
      :footer="null"
      :maskClosable="false"
    >
      <attribute-edit-modal
        @submit-success="handleSubmitSuccess"
        :attribute_id="attribute_id"
      ></attribute-edit-modal>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Inventories"
        sub-title="Manage and organize your product inventories"
      >
        <template #extra>
<!--          <a-button-->
<!--            class="add-inventory-btn"-->
<!--            type="primary"-->
<!--            @click="handleAdd"-->
<!--            :icon="h(PlusOutlined)"-->
<!--          >-->
<!--            Add Inventory-->
<!--          </a-button>-->
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

    <!-- Inventories table -->
    <div class="table-container">
      <a-table
        :dataSource="inventoryStore.inventories"
        :columns="columns"
        :pagination="pagination"
        :rowKey="record => record.id"
        :loading="loading"
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
          <template v-if="column.dataIndex === 'inventories'">
            <span v-for="(inventory, index) in record.inventories" :key="index">
              <a-tag color="blue" style="margin-bottom: 1px;">
                {{ inventory?.warehouse?.name || inventory?.store?.name }} : {{ inventory.quantity }}
              </a-tag>
            </span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                  type="link"
                  class="edit-btn"
                  @click="onEdit(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                :title="`Are you sure you want to delete ${record.sku}?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="onDelete(record.id)"
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
import { ref } from 'vue';
import { useInventoryStore } from '~/stores/invetory/InventoryStore.js';
import AttributeAddModal from "~/components/product/attributes/attributeAddModal.vue";
import AttributeEditModal from "~/components/product/attributes/attributeEditModal.vue";
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

const inventoryStore = useInventoryStore();
const loading = ref(false);
const open = ref(false);
const edit_open = ref(false);
let attribute_id = ref(null);

inventoryStore.fetchInventories();

const columns = [
  {
    title: 'Product',
    key: 'sku',
    dataIndex: 'stockQuantity',
    customRender: ({record}) => record.variant.Product ? record.variant.Product.name : '',
  },
  {
    title: 'Sku',
    customRender: ({record}) => record.variant ? record.variant.sku : '',
    key: 'sku',
  },
  {
    title: 'Quantity',
    customRender: ({record}) => record.variant ? record.variant.stockQuantity : '',
    key: 'stockQuantity',
  },
  {
    title: 'Variant',
    customRender: ({record}) => record.variant ? record.variant : '',
    key: 'variantAttributeValues',
  },
  {
    title: 'Category',
    key: 'category',
    customRender: ({record}) => record.variant.Product ? record.variant.Product.category.name : '',
  },
  {
    title: 'Subcategory',
    customRender: ({record}) => record.variant.Product ? record.variant.Product.subcategory.name : '',
    key: 'subcategoryId',
  },
  {
    title: 'Inventories',
    dataIndex: 'inventories',
    key: 'inventories',
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const pagination = ref({pageSize: 10});

const onDelete = async key => {
  await inventoryStore.deleteInventory(key);
};

const onEdit = async key => {
  attribute_id.value = parseInt(key);
  edit_open.value = true;
};

const handleAdd = () => {
  open.value = true;
};

const handleSubmitSuccess = () => {
  open.value = false;
  edit_open.value = false;
};

const onChange = (pagination, filters, sorter) => {
  console.log('params', pagination, filters, sorter);
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  // Implement search functionality
};

const handleReset = clearFilters => {
  clearFilters({
    confirm: true,
  });
  // Reset search
};

const exportToExcel = () => {
  const data = inventoryStore.inventories.map(inventory => ({
    Product: inventory.variant.Product ? inventory.variant.Product.name : '',
    SKU: inventory.variant ? inventory.variant.sku : '',
    Quantity: inventory.variant ? inventory.variant.stockQuantity : '',
    Category: inventory.variant.Product ? inventory.variant.Product.category.name : '',
    Subcategory: inventory.variant.Product ? inventory.variant.Product.subcategory.name : '',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventories");
  XLSX.writeFile(wb, "inventories.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Product', 'SKU', 'Quantity', 'Category', 'Subcategory']],
    body: inventoryStore.inventories.map(inventory => [
      inventory.variant.Product ? inventory.variant.Product.name : '',
      inventory.variant ? inventory.variant.sku : '',
      inventory.variant ? inventory.variant.stockQuantity : '',
      inventory.variant.Product ? inventory.variant.Product.category.name : '',
      inventory.variant.Product ? inventory.variant.Product.subcategory.name : '',
    ]),
  });
  doc.save('inventories.pdf');
};
</script>

<style scoped>
.inventory-container {
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

.add-inventory-btn {
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
