<template>
  <div class="div-container">

    <!-- Modals -->
    <a-modal
        v-model:open="is_visible"
        title="Add Variants"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        ok-text="Submit"
        width="100%"
        cancel-text="Cancel"
        :maskClosable="false"
    >
      <variants-add-modal @submit-success="handleSubmitSuccess" :product-id="product_id" />
      <template #footer> </template>
    </a-modal>
    <a-modal
      v-model:open="isAddModalOpen"
      title="Create Product"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      width="1000px"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <product-add-modal @submit-success="handleSubmitSuccess"></product-add-modal>
      <template #footer> </template>
    </a-modal>

    <a-modal
      v-model:open="isEditModalOpen"
      title="Edit Product"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <product-edit-modal
        @submit-success="handleSubmitSuccess"
        :productId="selectedProductId"
      ></product-edit-modal>
      <template #footer> </template>
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header
        class="div-header"
        title="Products"
        sub-title="Manage and organize your products"
      >
        <template #extra>
          <a-button
            class="add-product-btn"
            type="primary"
            @click="handleAddProduct"
            :icon="h(PlusOutlined)"
          >
            Create Product
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

    <!-- Products table -->
    <div class="div-table-container">
      <a-table
        :dataSource="productStore.products"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="productStore.loading"
        size="middle"
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
          <template v-if="column.dataIndex === 'status'">
            <span>
              <a-tag
                  :key="record.id"
                  :color="record?.variants?.length > 0 && record?.variants[0]?.stockQuantity > 0 ? 'success' : 'error'"
              >
                {{ record?.variants?.length > 0 && record?.variants[0]?.stockQuantity > 0 ? 'In Stock' : 'Out of Stock' }}
              </a-tag>
            </span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                  type="link"
                  class="edit-btn"
                  @click="handleEditProduct(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                :title="`Are you sure you want to delete ${record.name}?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="handleDeleteProduct(record.id)"
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
                    <a-menu-item key="view" @click="onView(record.id)">
                      <EyeOutlined /> View Details
                    </a-menu-item>
                    <a-menu-item key="duplicate" @click="onAdd(record.id)">
                      <CopyOutlined /> Add Variant
                    </a-menu-item>
                    <a-menu-item key="archive">
                      <InboxOutlined /> Archive
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link">
                  <MoreOutlined  />
                </a-button>
              </a-dropdown>
            </div>
          </template>
        </template>
        <template #expandedRowRender="{ record }">
          <a-table
              :columns="variantColumns"
              :data-source="record.variants"
              :pagination="false"
              size="small"
          >
            <template #bodyCell="{ column, text }">
              <template v-if="column.dataIndex === 'price'">
                {{ text ? `$${parseFloat(text).toFixed(2)}` : '-' }}
              </template>
            </template>
          </a-table>
        </template>
        <template #expandColumnTitle>
          <span style="color: #1890ff">Variants</span>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useProductStore } from '~/stores/product/ProductStore.js';
import productAddModal from "~/components/product/products/productAddModal.vue";
import productEditModal from "~/components/product/products/productEditModal.vue";
const tabsStore = useTabsStore();
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
  MoreOutlined
} from "@ant-design/icons-vue";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {useTabsStore} from "~/stores/tabsStore.js";
import attributesValuesTable from "~/components/product/attributes/attributesValuesTable.vue";
import productView from "~/components/product/products/productView.vue";
import VariantsAddModal from "~/components/product/products/variants/variantsAddModal.vue";

// Initialize product store and fetch products
const productStore = useProductStore();
productStore.fetchProducts();
console.log("products",productStore.products)
// Reactive variables
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedProductId = ref(null);
const searchInput = ref(null);

// Table columns configuration
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Category',
    customRender: ({record}) => record?.category ? record?.category?.name : '',
    key: 'category',
  },
  {
    title: 'Subcategory',
    customRender: ({record}) => record?.subcategory ? record?.subcategory?.name : '',
    key: 'subcategory',
  },
  {
    title: 'Brand',
    customRender: ({record}) => record?.brand ? record?.brand?.name : '',
    key: 'brandId',
  },
  {
    title: 'Unit',
    customRender: ({record}) => record?.Unit ? record?.Unit?.name : '',
    key: 'unitId',
  },
  {
    title: 'Low Stock Alert',
    dataIndex: 'lowStockAlert',
    key: 'lowStockAlert',
  },
  {
    title: 'VAT Type',
    dataIndex: 'VATType',
    key: 'VATType',
  },
  {
    title: 'Is Composition',
    dataIndex: 'isComposition',
    key: 'isComposition',
    customRender: (text) => (text ? 'Yes' : 'No'),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
    fixed: 'right',
  },
];
const variantColumns = [
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: 'Price', dataIndex: 'price', key: 'price' },
  { title: 'Stock Quantity', dataIndex: 'stockQuantity', key: 'stockQuantity' },
  { title: 'Code', dataIndex: 'code', key: 'code' },
  { title: 'Part Number', dataIndex: 'partNumber', key: 'partNumber' },
];

const pagination = ref({pageSize: 10});
const onView = (id) => {
  tabsStore.addTab('Product', productView, { id });
};
const product_id = ref(null)
const is_visible = ref(false)
const onAdd = (id) => {
  product_id.value = id
  is_visible.value = true
};
// Event handlers
const handleAddProduct = () => {
  isAddModalOpen.value = true;
};

const handleEditProduct = (productId) => {
  selectedProductId.value = productId;
  isEditModalOpen.value = true;
};

const handleDeleteProduct = async (productId) => {
  try {
    await productStore.deleteProduct(productId);
    console.log("Product deleted successfully:", productId);
  } catch (error) {
    console.error("Error deleting product:", error);
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
  is_visible.value = false;
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
  console.log('params', pagination, filters, sorter);
};

const exportToExcel = () => {
  const data = productStore.products.map(product => ({
    Name: product.name,
    Description: product.description,
    Category: product.categoryId,
    Brand: product.brandId,
    Status: product.status
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, "products.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Name', 'Description', 'Category', 'Brand', 'Status']],
    body: productStore.products.map(product => [
      product.name,
      product.description,
      product.categoryId,
      product.brandId,
      product.status
    ]),
  });
  doc.save('products.pdf');
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

.add-product-btn {
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
