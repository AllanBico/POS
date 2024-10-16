<template>
    <div class="price-rule-edit-modal">
      <h3 style="margin-top: 0">Edit Price Rule</h3>
      <a-divider style="margin-bottom: 11px; margin-top: 11px" />
      <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
        <a-form-item
          label="Rule Type"
          :rules="[{ required: true, message: 'Please select a rule type!' }]"
        >
          <a-select v-model:value="form.ruleType" placeholder="Select rule type" disabled>
            <a-select-option value="time">Time</a-select-option>
            <a-select-option value="bundle">Bundle</a-select-option>
            <a-select-option value="location">Location</a-select-option>
            <a-select-option value="quantity">Quantity</a-select-option>
            <a-select-option value="customer">Customer</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="Adjustment Type"
          :rules="[{ required: true, message: 'Please select an adjustment type!' }]"
        >
          <a-select v-model:value="form.adjustmentType" placeholder="Select adjustment type">
            <a-select-option value="percentage">Percentage</a-select-option>
            <a-select-option value="fixed">Fixed</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="Adjustment Value"
          :rules="[{ required: true, message: 'Please enter an adjustment value!' }, { type: 'number', message: 'Please enter a valid number!' }]"
        >
          <a-input-number v-model:value="form.adjustmentValue" placeholder="Enter adjustment value" />
        </a-form-item>
        <template v-if="form.ruleType === 'time'">
          <a-form-item label="Start Time" :rules="[{ type: 'string', message: 'Please enter a valid date!' }]" >
            <a-date-picker v-model:value="form.startTime" placeholder="Select start time" />
          </a-form-item>
          <a-form-item label="End Time" :rules="[{ type: 'string', message: 'Please enter a valid date!' }]" >
            <a-date-picker v-model:value="form.endTime" placeholder="Select end time" />
          </a-form-item>
          <a-form-item label="Daily Start Time" :rules="[{ type: 'string', message: 'Please enter a valid time!' }]" >
            <a-time-picker v-model:value="form.dailyStartTime" placeholder="Select daily start time" />
          </a-form-item>
          <a-form-item label="Daily End Time" :rules="[{ type: 'string', message: 'Please enter a valid time!' }]" >
            <a-time-picker v-model:value="form.dailyEndTime" placeholder="Select daily end time" />
          </a-form-item>
        </template>
        <template v-if="form.ruleType === 'bundle'">
          <a-form-item label="Bundle With Variant" :rules="[{ required: true, message: 'Please select a variant!' }]" >
            <a-select
              v-model:value="form.bundleWithVariantId"
              placeholder="Select Variant"
              show-search
              :filter-option="filterOption"
              :options="variantOptions"
            >
            </a-select>
          </a-form-item>
        </template>
        <template v-if="form.ruleType === 'location'">
          <a-form-item
            label="Location Type"
            :rules="[{ required: true, message: 'Please select a location type!' }]"
          >
            <a-select v-model:value="form.locationType" placeholder="Select location type" disabled>
              <a-select-option value="store">Store</a-select-option>
              <a-select-option value="warehouse">Warehouse</a-select-option>
            </a-select>
          </a-form-item>
          <template v-if="form.locationType">
            <a-form-item
              :label="form.locationType === 'warehouse' ? 'Warehouse' : 'Store'"
              name="locationId"
              :rules="[{ required: true, message: `Please select a ${form.locationType}` }]"
            >
              <a-select
                v-model:value="form.locationId"
                :placeholder="`Select ${form.locationType}`"
                show-search
                :filter-option="filterOption"
                :options="getDestinationOptions(form.locationType)"
              >
              </a-select>
            </a-form-item>
          </template>
        </template>
        <template v-if="form.ruleType === 'quantity'">
          <a-form-item label="Minimum Quantity" :rules="[{ required: true, message: 'Please enter a minimum quantity!' }, { type: 'number', message: 'Please enter a valid number!' }]" >
            <a-input-number v-model:value="form.minQuantity" placeholder="Enter minimum quantity" />
          </a-form-item>
        </template>
        <template v-if="form.ruleType === 'customer'">
          <a-form-item label="Customer" :rules="[{ required: true, message: 'Please select a customer!' }]" >
            <a-select
              v-model:value="form.customerId"
              placeholder="Select Customer"
              show-search
              :filter-option="filterOption"
              :options="customerOptions"
            >
            </a-select>
          </a-form-item>
        </template>
        <a-form-item>
          <a-button type="primary" :loading="productStore.loading" html-type="submit" block size="large">
            <template #icon><EditOutlined /></template>
            Update Price Rule
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useProductStore } from '~/stores/product/ProductStore.js';
  import { EditOutlined } from '@ant-design/icons-vue';
  import { useWarehouseStore } from '~/stores/WarehouseStore.js';
  import { useStoreStore } from '~/stores/storesStore.js';
  import { useCustomerStore } from '~/stores/CustomerStore.js';
  
  const props = defineProps({
    priceRuleId: {
        type: Number,
        required: true,
    },
  });
  
  const productStore = useProductStore();
  const warehouseStore = useWarehouseStore();
  const storesStore = useStoreStore();
  const customerStore = useCustomerStore();
  const emit = defineEmits(['submit-success']);
  const { $toast } = useNuxtApp();
  console.log("props.priceRuleId",props.priceRuleId)
  const priceRule = computed(() => productStore.priceRuleById(parseInt(props.priceRuleId)))
  console.log("priceRule",priceRule)
  const form = ref({
    id: props.priceRuleId,
    ruleType: priceRule.value.ruleType,
    adjustmentType: priceRule.value.adjustmentType,
    adjustmentValue: priceRule.value.adjustmentValue,
    startTime: priceRule.value.startTime,
    endTime: priceRule.value.endTime,
    dailyStartTime: priceRule.value.dailyStartTime,
    dailyEndTime: priceRule.value.dailyEndTime,
    bundleWithVariantId: priceRule.value.bundleWithVariantId,
    locationType: priceRule.value.locationType,
    locationId: priceRule.value.locationId,
    minQuantity: priceRule.value.minQuantity,
    customerId: priceRule.value.customerId,
    variantId: priceRule.value.variantId,
  });
  
  watch(
    () => props.priceRuleId,
    (newId) => {
      form.value = {
        id: newId,
        ruleType: priceRule.value.ruleType,
        adjustmentType: priceRule.value.adjustmentType,
        adjustmentValue: priceRule.value.adjustmentValue,
        startTime: priceRule.value.startTime,
        endTime: priceRule.value.endTime,
        dailyStartTime: priceRule.value.dailyStartTime,
        dailyEndTime: priceRule.value.dailyEndTime,
        bundleWithVariantId: priceRule.value.bundleWithVariantId,
        locationType: priceRule.value.locationType,
        locationId: priceRule.value.locationId,
        minQuantity: priceRule.value.minQuantity,
        customerId: priceRule.value.customerId,
        variantId: priceRule.value.variantId,
      };
    }
  );
  
  const handleSubmit = async () => {
    try {
      // Validate that all fields are filled
      if (!form.value.ruleType || !form.value.adjustmentType || !form.value.adjustmentValue) {
        throw new Error('All fields are required.');
      }
      // Call the store method to update the price rule
      await productStore.updatePriceRule(parseInt(props.priceRuleId),form.value);
      // Reset form
    //   form.value = {
    //     id: props.priceRuleId,
    //     ruleType: null,
    //     adjustmentType: null,
    //     adjustmentValue: null,
    //     startTime: null,
    //     endTime: null,
    //     dailyStartTime: null,
    //     dailyEndTime: null,
    //     bundleWithVariantId: null,
    //     locationType: null,
    //     locationId: null,
    //     minQuantity: null,
    //     customerId: null,
    //     variantId: null,
    //   };
      // Emit event to close the modal if needed
      emit('submit-success');
    } catch (error) {
      console.error('Error updating Price Rule:', error);
      $toast.error(error.message || 'Error Updating Price Rule');
    } finally {
      // loading.value = false; // Removed, using categoryStore.loading instead
    }
  };
  
  // Create `variantOptions` to transform variants into the {value, label} format
  const variantOptions = computed(() =>
    productStore.variants.map(variant => ({
      value: variant.id,
      label: `${variant.Product.name} (${variant.sku})`
    }))
  );
  
  // Define a filter option function for search
  const filterOption = (input, option) => {
    return option.label.toLowerCase().includes(input.toLowerCase());
  };
  
  // Get destination options based on selected type
  const getDestinationOptions = (destinationType) => {
    return destinationType === 'warehouse' ? warehouseStore.warehouses.map(warehouse => ({
      value: warehouse.id,
      label: warehouse.name
    })) : storesStore.stores.map(store => ({
      value: store.id,
      label: store.name
    }));
  };
  
  // Get customer options
  const customerOptions = computed(() =>
    customerStore.customers.map(customer => ({
      value: customer.id,
      label: customer.name
    }))
  );
  
  // Fetch warehouses and stores when the component is mounted
  warehouseStore.fetchWarehouses();
  storesStore.fetchStores();
  customerStore.fetchCustomers();
  </script>
  
  <style scoped>
  /* Add any custom styles if needed */
  </style>