<template>
  <div class="stock-transfer-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Stock Transfer"
        sub-title="Transfer stock between locations"
      >
        <template #extra>
          <a-button type="primary" @click="submitForm" :loading="loading">
            Transfer Stock
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <div class="content-container">
      <a-card class="form-card" :bordered="false">
        <a-form @submit.prevent="submitForm" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="Variant">
                <a-select
                  v-model:value="form.variantId"
                  placeholder="Select Variant"
                  show-search
                  :filter-option="filterOption"
                  style="width: 100%"
                >
                  <a-select-option
                    v-for="variant in productStore.variants"
                    :key="variant.id"
                    :value="variant.id"
                  >
                    {{ variant.sku }} - {{ variant.Product?.name || 'N/A' }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Quantity">
                <a-input-number v-model:value="form.quantity" min="1" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="Source">
                <a-select v-model:value="form.sourceType" placeholder="Select Source Type" style="width: 100%">
                  <a-select-option value="warehouse">Warehouse</a-select-option>
                  <a-select-option value="store">Store</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-if="form.sourceType" label="Source Location">
                <a-select
                  v-model:value="form.sourceId"
                  placeholder="Select Source"
                  style="width: 100%"
                >
                  <a-select-option
                    v-for="option in sourceOptions"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="Destination">
                <a-select v-model:value="form.destinationType" placeholder="Select Destination Type" style="width: 100%">
                  <a-select-option value="warehouse">Warehouse</a-select-option>
                  <a-select-option value="store">Store</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item v-if="form.destinationType" label="Destination Location">
                <a-select
                  v-model:value="form.destinationId"
                  placeholder="Select Destination"
                  style="width: 100%"
                >
                  <a-select-option
                    v-for="option in destinationOptions"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStockMovementStore } from '~/stores/invetory/StockMovementStore.js';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useStoreStore } from '~/stores/storesStore.js';
import { useWarehouseStore } from '~/stores/WarehouseStore.js';
import { message } from 'ant-design-vue';

const warehouseStore = useWarehouseStore();
const storeStore = useStoreStore();
const stockMovementStore = useStockMovementStore();
const productStore = useProductStore();

const loading = ref(false);

const form = ref({
  variantId: null,
  quantity: 1,
  sourceType: null,
  sourceId: null,
  destinationType: null,
  destinationId: null,
});

const sourceOptions = computed(() => 
  form.value.sourceType === 'warehouse' ? warehouseStore.warehouses : storeStore.stores
);

const destinationOptions = computed(() => 
  form.value.destinationType === 'warehouse' ? warehouseStore.warehouses : storeStore.stores
);

const filterOption = (input, option) => 
  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

const submitForm = async () => {
  if (!validateForm()) return;

  loading.value = true;
  try {
    await stockMovementStore.stockTransfer(form.value);
    message.success('Stock transfer completed successfully');
    resetForm();
  } catch (error) {
    message.error('Failed to transfer stock. Please try again.');
    console.error('Stock transfer error:', error);
  } finally {
    loading.value = false;
  }
};

const validateForm = () => {
  if (!form.value.variantId || !form.value.quantity || !form.value.sourceType || 
      !form.value.sourceId || !form.value.destinationType || !form.value.destinationId) {
    message.warning('Please fill in all fields');
    return false;
  }
  if (form.value.sourceId === form.value.destinationId) {
    message.warning('Source and destination cannot be the same');
    return false;
  }
  return true;
};

const resetForm = () => {
  form.value = {
    variantId: null,
    quantity: 1,
    sourceType: null,
    sourceId: null,
    destinationType: null,
    destinationId: null,
  };
};

onMounted(async () => {
  try {
    await Promise.all([
      storeStore.fetchStores(),
      warehouseStore.fetchWarehouses(),
      productStore.fetchVariants()
    ]);
  } catch (error) {
    message.error('Failed to load initial data. Please refresh the page.');
    console.error('Initial data loading error:', error);
  }
});
</script>

<style scoped>
.stock-transfer-container {
  background-color: #f0f2f5;
  padding: 24px;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.header {
  padding: 16px 24px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02);
  padding: 24px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #1f2937;
}

:deep(.ant-select-selector),
:deep(.ant-input-number),
:deep(.ant-input) {
  border-radius: 6px;
  border-color: #d1d5db;
}

:deep(.ant-select-selector:hover),
:deep(.ant-input-number:hover),
:deep(.ant-input:hover) {
  border-color: #4b5563;
}

:deep(.ant-btn-primary) {
  border-radius: 6px;
  height: 40px;
  font-weight: 500;
  box-shadow: 0 2px 0 rgba(5, 145, 255, 0.1);
}



@media (max-width: 768px) {
  .stock-transfer-container {
    padding: 16px;
  }

  .header-card,
  .form-card {
    padding: 16px;
  }

  :deep(.ant-col) {
    margin-bottom: 16px;
  }
}
</style>
