<template>
  <div class="stock-take-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Stock Take"
        sub-title="Record and manage your inventory count"
      >
        <template #extra>
          <a-button type="primary" @click="submitStockTake" :loading="loading">
            <template #icon><SaveOutlined /></template>
            Submit Stock Take
          </a-button>
          <a-button @click="resetForm">
            <template #icon><ReloadOutlined /></template>
            Reset
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <div class="content-container">
      <a-card class="info-card" :bordered="false">
        <a-form layout="vertical" class="stock-take-form">
          <a-row :gutter="16">
            <a-col :xs="24" :sm="8">
              <a-form-item label="Stock Take Date">
                <a-date-picker v-model:value="stockTakeDate" style="width: 100%" value-format="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-item label="Location">
                <a-select v-model:value="selectedLocation" placeholder="Select location">
                  <a-select-option value="warehouse1">Warehouse 1</a-select-option>
                  <a-select-option value="warehouse2">Warehouse 2</a-select-option>
                  <a-select-option value="store1">Store 1</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="8">
              <a-form-item label="Conducted By">
                <a-input v-model:value="conductedBy" placeholder="Enter name" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>

      <a-card class="table-card" :bordered="false">
        <template #title>
          <div class="table-header">
            <h3>Stock Take Items</h3>
          </div>
        </template>
        <a-table
          :columns="columns"
          :dataSource="tableData"
          :pagination="{ pageSize: 10 }"
          :scroll="{ y: 400 }"
          bordered
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'physicalQuantity'">
              <a-input-number
                v-model:value="record.physicalQuantity"
                :min="0"
                placeholder="Enter count"
                style="width: 100%"
              />
            </template>
            <template v-if="column.dataIndex === 'difference'">
              <span :class="getDifferenceClass(record)">
                {{ record.physicalQuantity - record.currentStock }}
              </span>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>


  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStockTakeStore } from "~/stores/invetory/StockTakeStore.js";
import {
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue';

const StockTakeStore = useStockTakeStore();

const props = defineProps({
  productData: {
    type: Object,
    required: true,
  },
});
const products = props.productData
const loading = ref(false);
const stockTakeDate = ref(null);
const selectedLocation = ref(null);
const conductedBy = ref('');

const columns = [
  { title: 'Product Name', dataIndex: 'productName', width: '25%', sorter: (a, b) => a.productName.localeCompare(b.productName) },
  { title: 'Variant SKU', dataIndex: 'variantSku', width: '15%' },
  { title: 'Current Stock', dataIndex: 'currentStock', width: '15%', sorter: (a, b) => a.currentStock - b.currentStock },
  { title: 'Counted Quantity', dataIndex: 'physicalQuantity', width: '20%' },
  { title: 'Difference', dataIndex: 'difference', width: '15%' },
];

const tableData = computed(() => {
  const data = [];
  for (const productKey in products) {
    const product = products[productKey];
    product.variants.forEach(variant => {
      data.push({
        key: `${product.product.id}-${variant.variant.id}`,
        productName: product.product.name,
        variantSku: variant.variant.sku,
        currentStock: variant.inventory.quantity,
        physicalQuantity: variant.physicalQuantity,
        variantId: variant.variant.id,
        warehouseId: variant?.inventory?.warehouse?.id,
        storeId: variant?.inventory?.store?.id,
      });
    });
  }
  return data;
});

const getDifferenceClass = (record) => {
  const diff = record.physicalQuantity - record.currentStock;
  if (diff === 0) return 'text-success';
  if (diff > 0) return 'text-info';
  return 'text-danger';
};

const submitStockTake = async () => {
  loading.value = true;
  try {
    const stockTakeData = tableData.value.map(item => ({
      variantId: item.variantId,
      physicalQuantity: item.physicalQuantity,
      systemQuantity: item.currentStock,
      warehouseId: item.warehouseId,
      storeId: item.storeId,
    }));

    await StockTakeStore.createStockTake(stockTakeData);
    // Add success message or redirect here
  } catch (error) {
    console.error('Error submitting stock take:', error);
    // Add error handling here
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  console.log("reset1")
  stockTakeDate.value = null;
  selectedLocation.value = null;
  conductedBy.value = '';
  tableData.value.forEach(item => {
    item.physicalQuantity = 0;
  });
  products.value = [];
  console.log("reset2")
};
</script>

<style scoped>
.stock-take-container {
  background-color: #f0f2f5;
  padding: 0px;
  border-radius: 12px;
}

.header-card {
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.header {
  padding: 24px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.info-card, .table-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

:deep(.ant-table) {
  font-size: 14px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #f6f8fa;
  color: #1f2937;
  font-weight: 600;
  padding: 16px;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 16px;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f9fafb;
}

:deep(.ant-form-item-label) {
  font-weight: 600;
  margin-bottom: 8px;
}

:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-input-number),
:deep(.ant-picker) {
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

:deep(.ant-btn) {
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 40px;
  font-weight: 500;
}

.mt-4 {
  margin-top: 24px;
}

.text-success {
  color: #52c41a;
}

.text-info {
  color: #1890ff;
}

.text-danger {
  color: #f5222d;
}

@media (max-width: 768px) {
  .stock-take-container {
    padding: 16px;
  }

  .header-card,
  .info-card,
  .table-card {
    padding: 16px;
  }

  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 12px;
  }
}
</style>