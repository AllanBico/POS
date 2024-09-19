<template>
  <a-card title="Stock Transfer">
    <a-form @submit.prevent="submitForm" layout="vertical">
      <!-- Variant Selection -->
      <a-form-item label="Variant">
        <a-select
            v-model:value="form.variantId"
            placeholder="Select Variant"
        >
          <a-select-option
              v-for="variant in productStore.variants"
              :key="variant.id"
              :value="variant.id"
          >
            {{ variant.sku }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- Quantity Input -->
      <a-form-item label="Quantity">
        <a-input-number v-model:value="form.quantity" min="1" />
      </a-form-item>

      <!-- Source Type Selection -->
      <a-form-item label="Source Type">
        <a-select v-model:value="form.sourceType" placeholder="Select Source Type">
          <a-select-option value="warehouse">Warehouse</a-select-option>
          <a-select-option value="store">Store</a-select-option>
        </a-select>
      </a-form-item>

      <!-- Source Location (Warehouse or Store) -->
      <a-form-item v-if="form.sourceType" label="Source Location">
        <a-select
            v-model:value="form.sourceId"
            placeholder="Select Source"
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

      <!-- Destination Type Selection -->
      <a-form-item label="Destination Type">
        <a-select v-model:value="form.destinationType" placeholder="Select Destination Type">
          <a-select-option value="warehouse">Warehouse</a-select-option>
          <a-select-option value="store">Store</a-select-option>
        </a-select>
      </a-form-item>

      <!-- Destination Location (Warehouse or Store) -->
      <a-form-item v-if="form.destinationType" label="Destination Location">
        <a-select
            v-model:value="form.destinationId"
            placeholder="Select Destination"
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

      <!-- Submit Button -->
      <a-form-item>
        <a-button type="primary" html-type="submit">Transfer Stock</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStockMovementStore } from '~/stores/invetory/StockMovementStore.js';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useStoreStore } from '~/stores/storesStore.js';
import {useWarehouseStore} from '~/stores/WarehouseStore.js';
const warehouseStore = useWarehouseStore();
const storeStore = useStoreStore();
storeStore.fetchStores()
warehouseStore.fetchWarehouses()
const StockMovementStore = useStockMovementStore();
const productStore = useProductStore();
productStore.fetchVariants();

const form = ref({
  variantId: null,
  quantity: 1,
  sourceType: null,
  sourceId: null,
  destinationType: null,
  destinationId: null,
});

const locations = ref({
  warehouse: [],
  store: [],
});
locations.value.warehouse = warehouseStore.warehouses;
locations.value.store = storeStore.stores;

// Computed property for source options (based on sourceType selection)
const sourceOptions = computed(() => {
  return form.value.sourceType === 'warehouse'
      ? warehouseStore.warehouses
      : storeStore.stores;
});

// Computed property for destination options (based on destinationType selection)
const destinationOptions = computed(() => {
  return form.value.destinationType === 'warehouse'
      ? warehouseStore.warehouses
      : storeStore.stores;
});

// Submit form handler
const submitForm = async () => {
  await StockMovementStore.stockTransfer(form.value);
  //form.value = { variantId: null, quantity: 1, sourceType: null, sourceId: null, destinationType: null, destinationId: null };
};
</script>
