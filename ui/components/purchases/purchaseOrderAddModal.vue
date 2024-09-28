<template>
  <div class="purchase-order-container">
    <a-form
      :model="formValues"
      @finish="onSubmit"
      layout="vertical"
      class="purchase-order-form"
    >
      <a-row :gutter="16" class="mb-4">
        <a-col :span="24">
          <!-- <h2 class="form-title">Create Purchase Order</h2> -->
          <p class="form-subtitle">Add a new purchase order to your system</p>
        </a-col>
      </a-row>

      <a-row :gutter="16" class="mb-4">
        <a-col :span="8">
          <a-form-item
            label="Supplier"
            name="supplierId"
            :rules="[{ required: true, message: 'Please select a supplier' }]"
          >
            <a-select
              v-model:value="formValues.supplierId"
              placeholder="Select Supplier"
              show-search
              :filter-option="filterOption"
            >
              <a-select-option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            label="Destination Type"
            name="destinationType"
            :rules="[{ required: true, message: 'Please select a destination type' }]"
          >
            <a-select
              v-model:value="formValues.destinationType"
              placeholder="Select Destination Type"
            >
              <a-select-option value="warehouse">Warehouse</a-select-option>
              <a-select-option value="store">Store</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            :label="formValues.destinationType === 'warehouse' ? 'Warehouse' : 'Store'"
            name="destinationId"
            :rules="[{ required: true, message: `Please select a ${formValues.destinationType}` }]"
          >
            <a-select
              v-model:value="formValues.destinationId"
              :placeholder="`Select ${formValues.destinationType === 'warehouse' ? 'Warehouse' : 'Store'}`"
              show-search
              :filter-option="filterOption"
            >
              <a-select-option 
                v-for="option in getDestinationOptions(formValues.destinationType)" 
                :key="option.id" 
                :value="option.id"
              >
                {{ option.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16" class="mb-4">
        <a-col :span="12">
          <a-form-item label="Expected Delivery Date" name="expectedDeliveryDate">
            <a-date-picker v-model:value="formValues.expectedDeliveryDate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Order Date" name="orderDate">
            <a-date-picker v-model:value="formValues.orderDate" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider class="my-4" />

      <a-row :gutter="16" class="mb-4">
        <a-col :span="24">
          <h3 class="section-title">
            <ShoppingCartOutlined class="mr-2" />
            Line Items
          </h3>
        </a-col>
      </a-row>

      <a-table
        :columns="columns"
        :dataSource="formValues.lineItems"
        :pagination="false"
        rowKey="id"
        bordered
        class="mb-4"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'variantId'">
            <a-select
              v-model:value="record.variantId"
              placeholder="Select Variant"
              show-search
              :filter-option="filterOption"
              style="width: 100%"
            >
              <a-select-option v-for="variant in variants" :key="variant.id" :value="variant.id">
                {{ variant.Product.name }} ({{ variant.sku }})
              </a-select-option>
            </a-select>
          </template>
          <template v-else-if="column.dataIndex === 'quantity'">
            <a-input-number
              v-model:value="record.quantity"
              :min="1"
              placeholder="Enter quantity"
              style="width: 100%"
            />
          </template>
          <template v-else-if="column.dataIndex === 'price'">
            <a-input-number
              v-model:value="record.price"
              :min="0"
              placeholder="Enter price"
              style="width: 100%"
            />
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button @click="removeItem(record.id)" type="danger" shape="circle">
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </template>
        </template>
      </a-table>

      <a-button @click="addItem" type="dashed" class="add-item-btn mb-4">
        <template #icon><PlusOutlined /></template>
        Add Item
      </a-button>

      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="purchaseOrderStore.loading" block>
          <template #icon><SaveOutlined /></template>
          Submit Purchase Order
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { usePurchaseOrderStore } from '~/stores/purchases/PurchaseOrderStore.js';
import { useSupplierStore } from '~/stores/product/SupplierStore.js';
import { useWarehouseStore } from '~/stores/WarehouseStore.js';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useStoreStore } from '~/stores/storesStore.js';
import {
  SaveOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';

const emit = defineEmits(['submit-success']);

// Initialize stores
const purchaseOrderStore = usePurchaseOrderStore();
const supplierStore = useSupplierStore();
const warehouseStore = useWarehouseStore();
const variantStore = useProductStore();
const storesStore = useStoreStore();

// Form state and values
const formValues = reactive({
  supplierId: null,
  destinationType: null,
  destinationId: null,
  orderDate: null,
  expectedDeliveryDate: null,
  lineItems: [],
});

const loading = ref(false);

// Columns for the table
const columns = [
  { title: 'Product (Variant)', dataIndex: 'variantId', width: '40%' },
  { title: 'Quantity', dataIndex: 'quantity', width: '20%' },
  { title: 'Price', dataIndex: 'price', width: '20%' },
  { title: 'Action', dataIndex: 'action', width: '20%' },
];

// Computed properties
const suppliers = computed(() => supplierStore.suppliers);
const warehouses = computed(() => warehouseStore.warehouses);
const variants = computed(() => variantStore.variants);
const stores = computed(() => storesStore.stores);

// Watch for changes in destinationType and reset destinationId
watch(() => formValues.destinationType, () => {
  formValues.destinationId = null;
});

// Form submission handler
const onSubmit = async () => {
  loading.value = true;
  if (formValues.destinationType === 'warehouse') {
    formValues.warehouseId = formValues.destinationId;
  }else if (formValues.destinationType === 'store') {
    formValues.storeId = formValues.destinationId;
  }
  try {
    await purchaseOrderStore.createPurchaseOrder(formValues);
    Object.assign(formValues, {
      supplierId: null,
      destinationType: null,
      destinationId: null,
      orderDate: null,
      expectedDeliveryDate: null,
      lineItems: [],
    });
    emit('submit-success');
  } catch (error) {
    console.error('Error creating purchase order:', error);
  } finally {
    loading.value = false;
  }
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
const filterOption = (input, option) => {
  const optionLabel = typeof option.children === 'string' ? option.children : option.children.toString();
  return optionLabel.toLowerCase().includes(input.toLowerCase());
};

// Get destination options based on selected type
const getDestinationOptions = (destinationType) => {
  return destinationType === 'warehouse' ? warehouses.value : stores.value;
};

// Fetch suppliers, warehouses, and variants when the component is mounted
supplierStore.fetchSuppliers();
warehouseStore.fetchWarehouses();
variantStore.fetchVariants();
storesStore.fetchStores();
</script>

<style scoped>
.purchase-order-container {
  max-height: 80vh;
  overflow-y: auto;
  padding: 4px;
}

.purchase-order-form {
  background-color: #ffffff;
  border-radius: 2px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #001529;
  margin-bottom: 16px;
}

.add-item-btn {
  width: 100%;
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

.mb-4 {
  margin-bottom: 16px;
}

.my-4 {
  margin-top: 16px;
  margin-bottom: 16px;
}

.mr-2 {
  margin-right: 8px;
}
</style>
