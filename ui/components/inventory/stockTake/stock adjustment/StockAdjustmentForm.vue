<template>
  <a-form @submit.prevent="handleSubmit" class="stock-adjustment-form">
    <a-form-item label="Stock Take ID">
      <a>{{ stockTake.id }}</a>
    </a-form-item>
    <a-form-item label="Product">
      <a>{{ stockTake.variant?.Product?.name || 'N/A' }}</a>
    </a-form-item>
    <a-form-item label="Variant SKU">
      <a>{{ stockTake.variant?.sku || 'N/A' }}</a>
    </a-form-item>
    <a-form-item label="Store">
      <a>{{ stockTake.store?.name || 'N/A' }}</a>
    </a-form-item>
    <a-form-item label="Warehouse">
      <a>{{ stockTake?.warehouse?.name || 'N/A' }}</a>
    </a-form-item>
    <a-form-item label="System Quantity">
      <a>{{ stockTake.systemQuantity }}</a>
    </a-form-item>
    <a-form-item label="Physical Quantity">
      <a>{{ stockTake.physicalQuantity }}</a>
    </a-form-item>
    <a-form-item label="Difference">
      <a>{{ stockTake.difference }}</a>
    </a-form-item>
    <a-form-item label="Adjustment Quantity">
      <a-input v-model:value="adjustmentQuantity" type="number" min="0" required />
    </a-form-item>
    <a-form-item label="Reason">
      <a-input v-model:value="reason" required />
    </a-form-item>
    <a-form-item label="Type">
      <a-select v-model:value="type" placeholder="Select Adjustment Type" required>
        <a-select-option value="stock in">Stock In</a-select-option>
        <a-select-option value="stock out">Stock Out</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="Serial Numbers">
      <a-input
          v-model:value="serialNumbers"
          placeholder="Enter serial numbers, comma separated"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStockTakeStore } from '~/stores/invetory/StockTakeStore.js'; // Adjust the path if necessary
import { useStockAdjustmentStore } from '~/stores/invetory/stockAdjustmentStore.js'; // Adjust the path if necessary

const emit = defineEmits(['submit-success']);
const props = defineProps({
  stockTakeId: {
    type: Number,
    required: true
  }
});

const stockAdjustmentStore = useStockAdjustmentStore();
const stockTakeStore = useStockTakeStore();

const reason = ref('');
const adjustmentQuantity = ref(0);
const type = ref(''); // Default is blank but required
const serialNumbers = ref(''); // Added for serial numbers

const stockTake = computed(() => {
  return stockTakeStore.StockTakeById(parseInt(props.stockTakeId));
});

const fetchStockTake = async () => {
  await stockTakeStore.StockTakeById(props.stockTakeId);
};

const handleSubmit = async () => {
  if (!type.value) {
    // Ensure type is selected before submitting
    alert('Please select the adjustment type.');
    return;
  }

  try {
    // Process serial numbers into an array if needed
    const serialNumberArray = serialNumbers.value.split(',').map(s => s.trim());

    await stockAdjustmentStore.createStockAdjustment({
      variantId: stockTake.value.variant?.id,
      storeId: stockTake.value.store?.id,
      warehouseId: stockTake.value.warehouse?.id,
      stockTakeId: props.stockTakeId,
      adjustmentQuantity: adjustmentQuantity.value,
      reason: reason.value,
      status: 'pending',
      type: type.value,
      serialNumbers: serialNumberArray // Include the serial numbers in the submission
    });
    reason.value = ''; // Clear the reason field
    adjustmentQuantity.value = 0; // Reset the quantity field
    type.value = ''; // Reset the type field
    serialNumbers.value = ''; // Reset the serial numbers field
    // Optionally, handle successful form submission (e.g., show a success message or redirect)
    emit('submit-success');
  } catch (error) {
    console.error('Failed to create stock adjustment', error);
  }
};

onMounted(() => {
  fetchStockTake();
});

watch(() => props.stockTakeId, () => {
  fetchStockTake();
});
</script>

<style scoped>
.stock-adjustment-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>
