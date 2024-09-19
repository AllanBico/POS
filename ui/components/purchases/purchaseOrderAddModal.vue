<template>
  <a-form
      :form="form"
      @finish="onSubmit"
      layout="vertical"
      v-loading="loading"
      @submit.prevent="onSubmit"
  >
    <!-- Supplier Selection -->
    <a-form-item
        label="Supplier"
        name="supplierId"
        rules="[ { required: true, message: 'Please select a supplier' } ]"
    >
      <a-select v-model:value="formValues.supplierId" placeholder="Select Supplier">
        <a-select-option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
          {{ supplier.name }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <!-- Warehouse Selection -->
    <a-form-item
        label="Warehouse"
        name="warehouseId"
        rules="[ { required: true, message: 'Please select a warehouse' } ]"
    >
      <a-select v-model:value="formValues.warehouseId" placeholder="Select Warehouse">
        <a-select-option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
          {{ warehouse.name }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <!-- Stores Selection -->
    <a-form-item
        label="Store"
        name="storeId"
        rules="[ { required: true, message: 'Please select a store' } ]"
    >
      <a-select v-model:value="formValues.storeId" placeholder="Select Store">
        <a-select-option v-for="store in stores" :key="store.id" :value="store.id">
          {{ store.name }}
        </a-select-option>
      </a-select>
    </a-form-item>


    <!-- Expected Delivery Date -->
    <a-form-item label="Expected Delivery Date" name="expectedDeliveryDate">
      <a-date-picker v-model:value="formValues.expectedDeliveryDate" />
    </a-form-item>

    <!-- Expected Order Date -->
    <a-form-item label="Expected Order Date" name="orderDate">
      <a-date-picker v-model:value="formValues.orderDate" />
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
        <a-input-number
            v-if="column.dataIndex === 'quantity'"
            v-model:value="record.quantity"
            min="1"
            placeholder="Enter quantity"
        />
        <a-input-number
            v-if="column.dataIndex === 'price'"
            v-model:value="record.price"
            min="0"
            placeholder="Enter price"
        />
        <a-select
            v-if="column.dataIndex === 'variantId'"
            v-model:value="record.variantId"
            placeholder="Select Variant"
            show-search
            :filter-option="filterOption"
        >
          <a-select-option v-for="variant in variants" :key="variant.id" :value="variant.id">
            {{ variant.Product.name }} ({{ variant.sku }})
          </a-select-option>
        </a-select>
        <a-button
            v-if="column.dataIndex === 'action'"
            @click="removeItem(record.id)"
            type="danger"
            icon="delete"
        >
          Remove
        </a-button>
      </template>
    </a-table>

    <!-- Add Line Item Button -->
    <a-button @click="addItem" type="dashed" class="add-item-btn">
      Add Item
    </a-button>

    <!-- Submit Button -->
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit Purchase Order</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { usePurchaseOrderStore } from '~/stores/purchases/PurchaseOrderStore.js';
import { useSupplierStore } from '~/stores/product/SupplierStore.js';
import { useWarehouseStore } from '~/stores/WarehouseStore.js';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useStoreStore } from '~/stores/storesStore.js';
const emit = defineEmits(['submit-success']);
// Initialize stores
const purchaseOrderStore = usePurchaseOrderStore();
const supplierStore = useSupplierStore();
const warehouseStore = useWarehouseStore();
const variantStore = useProductStore();
const StoresStore = useStoreStore()

// Form state and values
const form = ref(null);
const formValues = reactive({
  supplierId: null,
  warehouseId: null,
  orderDate:null,
  storeId:null,
  expectedDeliveryDate: null,
  lineItems: [],
});

// Columns for the table
const columns = [
  { title: 'Product (Variant)', dataIndex: 'variantId' },
  { title: 'Quantity', dataIndex: 'quantity' },
  { title: 'Price', dataIndex: 'price' },
  { title: 'Action', dataIndex: 'action' },
];

// Fetching necessary data
const suppliers = computed(() => supplierStore.suppliers);
const warehouses = computed(() => warehouseStore.warehouses);
const variants = computed(() => variantStore.variants);
const stores = computed(() => StoresStore.stores);

// Form submission handler
const onSubmit = async () => {
  await purchaseOrderStore.createPurchaseOrder(formValues);
  Object.assign(formValues, {
    supplierId: null,
    warehouseId: null,
    orderDate: null,
    storeId: null,
    expectedDeliveryDate: null,
    lineItems: [],
  });
  emit('submit-success');
};

// Add line item
const addItem = () => {
  formValues.lineItems.push({ id: Date.now(), variantId: null, quantity: 1, price: 0 });
};

// Remove line item
const removeItem = (id) => {
  formValues.lineItems = formValues.lineItems.filter(item => item.id !== id);
};

// Search filter for variants
// Search filter for variants
const filterOption = (input, option) => {
  // Ensure option.children is a string or convert it to a string
  const optionLabel = typeof option.children === 'string' ? option.children : option.children.toString();
  return optionLabel.toLowerCase().includes(input.toLowerCase());
};

// Fetch suppliers, warehouses, and variants when the component is mounted
supplierStore.fetchSuppliers();
warehouseStore.fetchWarehouses();
variantStore.fetchVariants();
StoresStore.fetchStores()
</script>

<style scoped>
.add-item-btn {
  margin-top: 16px;
  width: 100%;
}
</style>
