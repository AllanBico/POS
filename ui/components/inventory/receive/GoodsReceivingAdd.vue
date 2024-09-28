<template>
  <div class="goods-receiving-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Goods Receiving"
        :sub-title="`Purchase Order #${formValues.purchaseOrderId}`"
      >
        <template #extra>
          <a-button type="primary" @click="onSubmit" :loading="loading">
            Submit Goods Receiving
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <div class="content-container">
      <a-card class="info-card" :bordered="false">
        <a-descriptions title="Purchase Order Information" bordered>
          <a-descriptions-item label="Supplier">
            {{ purchaseOrder?.supplier?.name }}
          </a-descriptions-item>
          <a-descriptions-item label="Destination Type">
            {{ purchaseOrder?.warehouse ? 'Warehouse' : 'Store' }}
          </a-descriptions-item>
          <a-descriptions-item label="Destination">
            {{ purchaseOrder?.warehouse?.name || purchaseOrder?.store?.name }}
          </a-descriptions-item>
          <a-descriptions-item label="Order Date">
            {{formatDate(purchaseOrder.orderDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="Expected Delivery Date">
            {{formatDate(purchaseOrder.expectedDeliveryDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="Received Date">
            <a-date-picker v-model:value="formValues.receivedDate" style="width: 100%" />
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-form
        :form="form"
        @finish="onSubmit"
        layout="vertical"
      >
        <a-card class="table-card" :bordered="false">
          <template #title>
            <div class="table-header">
              <h3>Line Items</h3>
            </div>
          </template>
          <a-table
            :columns="columns"
            :dataSource="formValues.lineItems"
            :pagination="false"
            rowKey="id"
            :bordered="true"
            class="line-items-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'variantId'">
                <a-select
                  v-model:value="record.variantId"
                  placeholder="Select Variant"
                  show-search
                  :filter-option="filterOption"
                  style="width: 100%"
                  disabled
                >
                  <a-select-option
                    v-for="variant in variants"
                    :key="variant.id"
                    :value="variant.id"
                  >
                    {{ variant.Product.name }} ({{ variant.sku }})
                  </a-select-option>
                </a-select>
              </template>
              <template v-else-if="column.dataIndex === 'orderedQuantity'">
                {{ record.quantity - record.expectedQuantity }}
              </template>
              <template v-else-if="column.dataIndex === 'receivedQuantity'">
                <a-input-number
                  v-model:value="record.receivedQuantity"
                  :min="0"
                  :max="record.quantity"
                  placeholder="Enter received quantity"
                  style="width: 100%"
                  @change="(value) => handleReceivedQuantityChange(record, value)"
                />
              </template>
              <template v-else-if="column.dataIndex === 'serialNumbers'">
                <a-button @click="openSerialNumberModal(record)">
                  Manage Serial Numbers
                </a-button>
              </template>
              <template v-else-if="column.dataIndex === 'note'">
                <a-input
                  v-model:value="record.note"
                  placeholder="Enter note"
                  style="width: 100%"
                />
              </template>
            </template>
          </a-table>
        </a-card>
      </a-form>
    </div>

    <a-modal
      v-model:visible="serialNumberModalVisible"
      title="Manage Serial Numbers"
      @ok="saveSerialNumbers"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item v-for="(serialNumber, index) in serialNumbers" :key="index" :label="`Serial Number ${index + 1}`">
          <a-input v-model:value="serialNumbers[index]" placeholder="Enter serial number" />
        </a-form-item>
      </a-form>
      <a-button
          @click="addEmptySerialNumberInput"
          type="dashed"
          style="width: 100%; margin-top: 16px;"
      >
        Add Empty Serial Number Input
      </a-button>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useGoodsReceivingStore } from '~/stores/invetory/GoodsReceivingStore.js';
import { useWarehouseStore } from '~/stores/WarehouseStore.js';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useStoreStore } from '~/stores/storesStore.js';
import { usePurchaseOrderStore } from '~/stores/purchases/PurchaseOrderStore.js';
const { initDateFormat, formatDate } = useDateFormatter();
const props = defineProps({
  purchaseOrderId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['submit-success']);
const form = ref(null);
const formValues = reactive({
  purchaseOrderId: props.purchaseOrderId,
  supplier: '',
  receivedDate: null,
  orderDate: null,
  expectedDeliveryDate: null,
  lineItems: [],
});

// Modal State
const serialNumberModalVisible = ref(false);
const serialNumbers = ref([]);
const scannedSerialNumber = ref('');
const scannerInput = ref(null);
let currentLineItem = null;

// Initialize stores
const goodsReceivingStore = useGoodsReceivingStore();
const warehouseStore = useWarehouseStore();
const productStore = useProductStore();
const storeStore = useStoreStore();
const purchaseOrderStore = usePurchaseOrderStore();

const warehouses = computed(() => warehouseStore.warehouses);
const variants = computed(() => productStore.variants);
const stores = computed(() => storeStore.stores);
const purchaseOrder = await purchaseOrderStore.purchaseOrderById(props.purchaseOrderId);
// Fetch Purchase Order Details
const fetchPurchaseOrderDetails = async () => {

  if (purchaseOrder) {
    formValues.supplier = purchaseOrder.supplier.name;
    formValues.warehouseId = purchaseOrder.warehouseId ;
    formValues.storeId = purchaseOrder.storeId ;
    formValues.orderDate = purchaseOrder.orderDate;
    formValues.expectedDeliveryDate = purchaseOrder.expectedDeliveryDate;
    formValues.lineItems = purchaseOrder.lineItems.map(item => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      expectedQuantity : item.receivedQuantity,
      receivedQuantity: item.quantity,
      serialNumbers: item.serialNumbers || [],
      note: '',
    }));
  }
};

// Get destination name
const getDestinationName = (id) => {
  if (formValues.destinationType === 'warehouse') {
    return warehouses.value.find(w => w.id === id)?.name || '';
  } else {
    return stores.value.find(s => s.id === id)?.name || '';
  }
};

// Define columns for the table
const columns = [
  { title: 'Variant', dataIndex: 'variantId', key: 'variantId' },
  { title: 'Expected Quantity', dataIndex: 'orderedQuantity', key: 'orderedQuantity' },
  { title: 'Received Quantity', dataIndex: 'receivedQuantity', key: 'receivedQuantity' },
  { title: 'Serial Numbers', dataIndex: 'serialNumbers', key: 'serialNumbers' },
  { title: 'Note', dataIndex: 'note', key: 'note' },
];

// Open Serial Number Modal
const openSerialNumberModal = (record) => {
  serialNumberModalVisible.value = true;
  currentLineItem = record;
  serialNumbers.value = [...record.serialNumbers];
  nextTick(() => {
    if (scannerInput.value) {
      scannerInput.value.focus();
    }
  });
};

// Save Serial Numbers
const saveSerialNumbers = () => {
  currentLineItem.serialNumbers = serialNumbers.value.filter(sn => sn.trim() !== '');
  serialNumberModalVisible.value = false;
};

// Add empty input for serial numbers
const addEmptySerialNumberInput = () => {
  serialNumbers.value.push('');
};

// Handle serial number input (for both scanning and typing)
const handleSerialNumberInput = (index) => {
  if (scannedSerialNumber.value.trim() !== '') {
    serialNumbers.value.push(scannedSerialNumber.value.trim());
    scannedSerialNumber.value = '';
    addEmptySerialNumberInput();
  } else if (serialNumbers.value[index].trim() !== '') {
    addEmptySerialNumberInput();
  }
  nextTick(() => {
    if (scannerInput.value) {
      scannerInput.value.focus();
    }
  });
};

// Handle received quantity change
const handleReceivedQuantityChange = (record, value) => {
  if (value > record.quantity) {
    record.receivedQuantity = record.quantity;
  }
};

// Form submission handler
const onSubmit = async () => {
  console.log("formValues",formValues)
  if (formValues.destinationType === 'warehouse') {
    formValues.warehouseId = formValues.destinationId;
  } else if (formValues.destinationType === 'store') {
    formValues.storeId = formValues.destinationId;
  }
  await goodsReceivingStore.receiveGoods(formValues);
  emit('submit-success');
};

// Search filter for variants
const filterOption = (input, option) => {
  const optionLabel = typeof option.children === 'string' ? option.children : option.children.toString();
  return optionLabel.toLowerCase().includes(input.toLowerCase());
};

// Fetch necessary data when the component is mounted
onMounted(() => {
  warehouseStore.fetchWarehouses();
  productStore.fetchVariants();
  storeStore.fetchStores();
  fetchPurchaseOrderDetails();
});
</script>

<style scoped>
.goods-receiving-container {
  background-color: #f0f2f5;
  padding: 24px;
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
  margin-bottom: 24px;
}

.line-items-table {
  margin-top: 24px;
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



:deep(.ant-descriptions-bordered .ant-descriptions-view) {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

:deep(.ant-descriptions-bordered .ant-descriptions-item-label),
:deep(.ant-descriptions-bordered .ant-descriptions-item-content) {
  padding: 16px 24px;
  border-right: 1px solid #f0f0f0;
}

:deep(.ant-modal-content) {
  border-radius: 12px;
}

:deep(.ant-modal-header) {
  border-radius: 12px 12px 0 0;
}

:deep(.ant-modal-body) {
  padding: 24px;
}

@media (max-width: 768px) {
  .goods-receiving-container {
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
