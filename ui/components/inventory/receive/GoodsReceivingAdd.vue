<template>
  <a-form
      :form="form"
      @finish="onSubmit"
      layout="vertical"
      v-loading="loading"
      @submit.prevent="onSubmit"
  >
    <!-- Purchase Order ID -->
    <a-form-item label="Purchase Order ID" name="purchaseOrderId">
      <a-input v-model:value="formValues.purchaseOrderId" :disabled="true" />
    </a-form-item>

    <!-- Supplier Information -->
    <a-form-item label="Supplier" name="supplier">
      <a-input v-model:value="formValues.supplier" :disabled="true" />
    </a-form-item>

    <!-- Warehouse Selection -->
    <a-form-item label="Warehouse" name="warehouseId" rules="[ { required: true, message: 'Please select a warehouse' } ]">
      <a-select v-model:value="formValues.warehouseId" placeholder="Select Warehouse">
        <a-select-option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
          {{ warehouse.name }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <!-- Store Selection -->
    <a-form-item label="Store" name="storeId" rules="[ { required: true, message: 'Please select a store' } ]">
      <a-select v-model:value="formValues.storeId" placeholder="Select Store">
        <a-select-option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <!-- Received Date -->
    <a-form-item label="Received Date" name="receivedDate">
      <a-date-picker v-model:value="formValues.receivedDate"  />
    </a-form-item>

    <!-- Line Items Table -->
    <a-table
        :columns="columns"
        :dataSource="formValues.lineItems"
        :pagination="false"
        rowKey="id"
        bordered
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column?.dataIndex === 'quantity'">
          <a-input-number
              v-model:value="record.quantity"
              min="1"
              placeholder="Enter quantity"
              @change="openSerialNumberModal(record)"
          />
        </template>
        <template v-else-if="column?.dataIndex === 'price'">
          <a-input-number
              v-model:value="record.price"
              min="0"
              placeholder="Enter price"
          />
        </template>
        <template v-else-if="column?.dataIndex === 'variantId'">
          <a-select
              v-model:value="record.variantId"
              placeholder="Select Variant"
              show-search
              :filter-option="filterOption"
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
        <template v-else-if="column?.dataIndex === 'serialNumbers'">
          <a-button @click="openSerialNumberModal(record)">Add Serial Numbers</a-button>
        </template>
        <template v-else-if="column?.dataIndex === 'action'">
          <a-button @click="removeItem(record.id)" type="danger" icon="delete">
            Remove
          </a-button>
        </template>
      </template>
    </a-table>

    <!-- Add Line Item Button -->
    <a-button @click="addItem" type="dashed" class="add-item-btn">
      Add Item
    </a-button>

    <!-- Submit Button -->
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit Goods Receiving</a-button>
    </a-form-item>
    <!-- Serial Number Modal -->
    <a-modal
        v-model:visible="serialNumberModalVisible"
        title="Enter Serial Numbers"
        @ok="saveSerialNumbers"
    >
      <div v-for="(serialNumber, index) in serialNumbers" :key="index">
        <a-input
            v-model:value="serialNumbers[index]"
            placeholder="Enter serial number"
        />
      </div>
      <a-button @click="addSerialNumberInput">Add Serial Number</a-button>
    </a-modal>
  </a-form>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useGoodsReceivingStore } from '~/stores/GoodsReceivingStore.js';
import { useWarehouseStore } from '~/stores/WarehouseStore.js';
import { useProductStore } from '~/stores/ProductStore.js';
import { useStoreStore } from '~/stores/storesStore.js';
import { usePurchaseOrderStore } from '~/stores/PurchaseOrderStore.js';

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
  warehouseId: null,
  storeId: null,
  receivedDate: null,
  lineItems: [],
});

// Modal State
const serialNumberModalVisible = ref(false);
const serialNumbers = ref([]); // To hold serial numbers temporarily
let currentLineItem = null; // Keep track of which line item is being edited

// Initialize stores
const goodsReceivingStore = useGoodsReceivingStore();
const warehouseStore = useWarehouseStore();
const productStore = useProductStore();
const storeStore = useStoreStore();
const purchaseOrderStore = usePurchaseOrderStore();

const warehouses = computed(() => warehouseStore.warehouses);
const variants = computed(() => productStore.variants);
const stores = computed(() => storeStore.stores);
// Fetch Purchase Order Details
const fetchPurchaseOrderDetails = async () => {
  const purchaseOrder = await purchaseOrderStore.purchaseOrderById(props.purchaseOrderId);
  if (purchaseOrder) {
    formValues.supplier = purchaseOrder.supplier.name; // Adjust based on actual data structure
    formValues.warehouseId = purchaseOrder.warehouseId;
    formValues.storeId = purchaseOrder.storeId;
    formValues.lineItems = purchaseOrder.lineItems.map(item => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      serialNumbers: item.serialNumbers || [], // Ensure serialNumbers is an array
    }));

  }
};
// Define columns for the table
const columns = [
  { title: 'Variant', dataIndex: 'variantId', key: 'variantId' },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
  { title: 'Price', dataIndex: 'price', key: 'price' },
  { title: 'Serial Numbers', dataIndex: 'serialNumbers', key: 'serialNumbers' },
  { title: 'Action', dataIndex: 'action', key: 'action' },
];

// Add line item
const addItem = () => {
  formValues.lineItems.push({
    id: Date.now(),
    variantId: null,
    quantity: 1,
    price: 0,
    serialNumbers: [], // Initialize serialNumbers as an array
  });
};


// Remove line item
const removeItem = (id) => {
  formValues.lineItems = formValues.lineItems.filter((item) => item.id !== id);
};

// Open Serial Number Modal
const openSerialNumberModal = (record) => {
  serialNumberModalVisible.value = true;
  currentLineItem = record;
  serialNumbers.value = [...record.serialNumbers]; // Pre-fill serial numbers
};

// Save Serial Numbers
const saveSerialNumbers = () => {
  currentLineItem.serialNumbers = [...serialNumbers.value];
  serialNumberModalVisible.value = false;
};

// Add input for serial numbers dynamically
const addSerialNumberInput = () => {
  serialNumbers.value.push('');
};

// Form submission handler
const onSubmit = async () => {
  await goodsReceivingStore.receiveGoods(formValues);
  emit('submit-success');
};

// Fetch necessary data when the component is mounted
onMounted(() => {
  // Fetch warehouses, products, and stores
  warehouseStore.fetchWarehouses();
  productStore.fetchVariants();
  storeStore.fetchStores();
});
fetchPurchaseOrderDetails();
</script>

<style scoped>
.add-item-btn {
  margin-top: 16px;
  width: 100%;
}
</style>
