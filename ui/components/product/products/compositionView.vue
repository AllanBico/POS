<template>
  <a-modal
      v-model:open="open"
      title="Add Composition"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
      :footer="null"
  >
    <composition-form @submit-success="handleSubmitSuccess" :variant_id="variant_id"></composition-form></a-modal>
  <a-modal
      v-model:open="edit_open"
      title="Edit Composition"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
      :footer="null"
  >
    <edit-composition-quantity ref="editQuantityModal" :composition-id="selectedCompositionId" @submit-success="handleSubmitSuccess" />

  </a-modal>
  <div class="composition-container">
    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
          class="header"
          :title="`${variant?.Product?.name || 'Unknown Product'} (${variant?.sku || 'No SKU'}) Compositions`"
          sub-title="Manage and organize your product compositions"
      >
        <template #extra>
          <a-button
              class="add-composition-btn"
              type="primary"
              @click="handleAddComposition"
              :icon="h(PlusOutlined)"
          >
            Add Composition
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

    <!-- Compositions table -->
    <div class="table-container">
      <a-table
          :dataSource="productStore.compositions"
          :columns="columns"
          :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
          :rowKey="(record) => record.id"
          :loading="loading"
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
          <search-outlined :class="{ 'text-primary': filtered }" />
        </template>

        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'quantity'">
            {{record.quantity}} {{record?.ingredientVariant?.Product?.Unit?.abbreviation}}
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                    type="link"
                    class="edit-btn"
                    @click="handleEditQuantity(record.id)"
                    :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                  :title="`Are you sure you want to delete this composition?`"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="handleDeleteComposition(record.id)"
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
import { ref, onMounted } from 'vue';
import { useProductStore } from "~/stores/product/ProductStore.js";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons-vue";

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CompositionForm from "~/components/product/products/compositionForm.vue";
import EditCompositionQuantity from "~/components/product/products/EditCompositionQuantity.vue";
const open = ref(false);
const edit_open = ref(false);
const productStore = useProductStore();
const props = defineProps({
  variant_id: {
    type: Number,
    required: true
  }
});

const compositions = ref([]);
const loading = ref(true);
const searchInput = ref(null);
const variant = computed(() => {
  return productStore.variantById(parseInt(props.variant_id))
})
const columns = [
  {
    title: 'Product',
    customRender: ({record}) => record?.ingredientVariant ? record?.ingredientVariant?.Product?.name : '',
    key: 'Product',
    sorter: (a, b) => a.Product - b.Product,
    customFilterDropdown: true,
    onFilter: (value, record) => record.Product.toString().includes(value),
  },
  {
    title: 'Variant',
    customRender: ({record}) => record?.ingredientVariant ? record?.ingredientVariant?.sku : '',
    key: 'ingredientVariantId',
    sorter: (a, b) => a.ingredientVariantId - b.ingredientVariantId,
    customFilterDropdown: true,
    onFilter: (value, record) => record.ingredientVariantId.toString().includes(value),
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    sorter: (a, b) => a.quantity - b.quantity,
    customFilterDropdown: true,
    onFilter: (value, record) => record.quantity.toString().includes(value),
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
  }
];

const fetchCompositions = async () => {
  try {
    compositions.value = await productStore.fetchCompositionsByVariantId(parseInt(props.variant_id));
    console.log("compositions.value", compositions.value);
  } catch (err) {
    console.error('Error fetching compositions:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCompositions();
});

const handleAddComposition = () => {
  open.value = true;
};

const handleEditComposition = (id) => {
  // Implement edit composition logic
};

const handleDeleteComposition = async (id) => {
  await productStore.deleteComposition(parseInt(id))
};

const handleTableChange = (pagination, filters, sorter) => {
  // Implement table change logic if needed
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  // Implement search logic
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
  // Implement reset logic
};

const viewComposition = (id) => {
  // Implement view composition logic
};

const exportToExcel = () => {
  const data = compositions.value.map(composition => ({
    'Ingredient Variant ID': composition.ingredientVariantId,
    'Quantity': composition.quantity
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Compositions");
  XLSX.writeFile(wb, "compositions.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Ingredient Variant ID', 'Quantity']],
    body: compositions.value.map(composition => [composition.ingredientVariantId, composition.quantity]),
  });
  doc.save('compositions.pdf');
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

const selectedCompositionId = ref(null);

const handleEditQuantity = (id) => {
  selectedCompositionId.value = id;
  edit_open.value = true
};

const handleQuantityUpdate = (newQuantity) => {
  // Update the local data or refetch the compositions
  fetchCompositions();
};
</script>

<style scoped>
.composition-container {
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

.add-composition-btn {
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
