<template>
  <div class="div-container">
    <!-- Modals -->
    <a-modal
      v-model:open="open"
      title="Add Product"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <attribute-add-modal @submit-success="handleSubmitSuccess"></attribute-add-modal>
      <template #footer> </template>
    </a-modal>
    <a-modal
      v-model:open="edit_open"
      title="Edit Product"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <attribute-edit-modal @submit-success="handleSubmitSuccess" :attribute_id="attribute_id"></attribute-edit-modal>
      <template #footer> </template>
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header
        class="div-header"
        title="Variants"
        sub-title="Manage and organize your variants"
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
    
    <!-- Variants table -->
    <div class="div-table-container">
      <a-table
        :dataSource="productStore.variants"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="productStore.loading"
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
                  :color="record.status ? 'success' : 'error'"
              >
                {{ record.status ? 'Active' : 'Inactive' }}
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
                    <a-menu-item key="view" @click="onCompositionView(record.id)">
                      <EyeOutlined /> Composition View
                    </a-menu-item>
                    <a-menu-item key="composition" @click="onComposition(record.id)">
                      <CopyOutlined /> Composition
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
      </a-table>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  MoreOutlined,
  SearchOutlined,
  FilePdfOutlined, FileExcelOutlined, DownOutlined
} from "@ant-design/icons-vue";
import {useProductStore} from '~/stores/product/ProductStore.js';
import AttributeAddModal from "~/components/product/attributes/attributeAddModal.vue";
import AttributeEditModal from "~/components/product/attributes/attributeEditModal.vue";
import createProduct from "~/components/product/products/createProduct.vue";
import {useTabsStore} from '~/stores/tabsStore.js';
import compositionForm from "~/components/product/products/compositionForm.vue";
import compositionView from "~/components/product/products/compositionView.vue";

const productStore = useProductStore();
const tabsStore = useTabsStore();
const loading = ref(false);
const open = ref(false);
const edit_open = ref(false);
let attribute_id = ref(null)
productStore.fetchVariants()
console.log("productStore.variants", productStore.variants)
const columns = [
  {
    title: 'Product',
    key: 'productName',
    customRender: ({record}) => record.Product ? record.Product.name : 'N/A',
    sorter: (a, b) => (a.Product?.name || '').localeCompare(b.Product?.name || ''),
    filterSearch: true,
    onFilter: (value, record) => record.Product?.name.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Sku',
    dataIndex: 'sku',
    key: 'sku',
    sorter: (a, b) => a.sku.localeCompare(b.sku),
    filterSearch: true,
    onFilter: (value, record) => record.sku.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
  },
  {
    title: 'Quantity',
    dataIndex: 'stockQuantity',
    key: 'stockQuantity',
    sorter: (a, b) => a.stockQuantity - b.stockQuantity,
  },
  {
    title: 'Variant Attributes',
    key: 'variantAttributeValues',
    customRender: ({record}) => record.variantAttributeValues.map(attr => `${attr.attributeValue.attribute.name}: ${attr.attributeValue.value}`).join(', '),
    filterSearch: true,
    onFilter: (value, record) => record.variantAttributeValues.some(attr => attr.attributeValue.value.toLowerCase().includes(value.toLowerCase())),
  },
  {
    title: 'Description',
    key: 'description',
    customRender: ({record}) => record.Product ? record.Product.description : 'N/A',
    filterSearch: true,
    onFilter: (value, record) => record.Product?.description.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Category',
    key: 'category',
    customRender: ({record}) => record.Product ? record.Product.category.name : 'N/A',
    sorter: (a, b) => (a.Product?.category.name || '').localeCompare(b.Product?.category.name || ''),
    filterSearch: true,
    onFilter: (value, record) => record.Product?.category.name.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Subcategory',
    customRender: ({record}) => record.Product ? record.Product.subcategory.name : 'N/A',
    key: 'subcategoryId',
    scopedSlots: {customRender: 'subcategory'},
    sorter: (a, b) => (a.Product?.subcategory.name || '').localeCompare(b.Product?.subcategory.name || ''),
    filterSearch: true,
    onFilter: (value, record) => record.Product?.subcategory.name.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Unit',
    key: 'unit',
    customRender: ({record}) => record.Product ? `${record.Product.Unit.name} (${record.Product.Unit.abbreviation})` : 'N/A',
  },
  {
    title: 'Low Stock Alert',
    key: 'lowStockAlert',
    dataIndex: 'Product.lowStockAlert',
    sorter: (a, b) => a.Product.lowStockAlert - b.Product.lowStockAlert,
  },
  {
    title: 'VAT Type',
    key: 'VATType',
    dataIndex: 'Product.VATType',
  },
  {
    title: 'Composition',
    customRender: ({record}) => record?.Product?.isComposition ? 'Yes' : 'No',
    key: 'Composition',
    sorter: (a, b) => (a.Product?.isComposition ? 1 : 0) - (b.Product?.isComposition ? 1 : 0),
    filters: [
      { text: 'Yes', value: true },
      { text: 'No', value: false },
    ],
    onFilter: (value, record) => record.Product?.isComposition === value,
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];
const onCreate = async () => {
  tabsStore.addTab('Create Product', createProduct);
};
const onComposition = key => {
  tabsStore.addTab('Product Composition', compositionForm, { variant_id: key });
};
const onCompositionView = key => {
  tabsStore.addTab('Product Composition', compositionView, { variant_id: key });
};

const pagination = ref({pageSize: 10});
const edit = key => {
};
const save = key => {
};
const onDelete = async key => {
  await productStore.deleteVariant(key)
  console.log("deleted", key)
};
const onEdit = async key => {
  console.log("edit", key)
  attribute_id = parseInt(key)
  console.log("attribute_id", attribute_id)
  edit_open.value = true
  console.log("done")
};

const handleOk = () => {
  open.value = false;
  // Optionally handle any additional logic here
};
const handleCancel = () => {
  open.value = false;
  edit_open.value = false;
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
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};
const handleReset = clearFilters => {
  clearFilters({
    confirm: true,
  });
  state.searchText = '';
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
