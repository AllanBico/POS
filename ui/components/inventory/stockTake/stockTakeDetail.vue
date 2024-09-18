<template>
  <a-modal v-model:open="open" title="Create Stock Adjustment" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
           cancel-text="Cancel">
    <stock-adjustment-form @submit-success="handleSubmitSuccess"  :stock-take-id="stock_take_id"></stock-adjustment-form>
    <template #footer>
    </template>
  </a-modal>
  <div class="stock-take-detail">
    <a-card title="Stock Take Details" bordered={false} v-if="stockTake">
      <a-row gutter={16}>
        <a-col :span="12">
          <a-form-item label="Product">
            <a>{{ stockTake.variant.Product.name }} (SKU: {{ stockTake.variant.sku }})</a>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Store">
            <a>{{ stockTake.store ? stockTake.store.name : 'N/A' }}</a>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Warehouse">
            <a>{{ stockTake.warehouse ? 'Warehouse ID: ' + stockTake.warehouseId : 'N/A' }}</a>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="System Quantity">
            <a>{{ stockTake.systemQuantity }} {{stockTake?.variant?.Product?.Unit?.abbreviation}}</a>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Physical Quantity">
            <a>{{ stockTake.physicalQuantity }} {{stockTake?.variant?.Product?.Unit?.abbreviation}}</a>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Difference">
            <a>{{ stockTake.difference }}</a>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Date">
            <a>{{ new Date(stockTake.date).toLocaleDateString() }}</a>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Status">
            <a>{{ stockTake.status }}</a>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Created By">
            <a>{{ stockTake?.user?.name }}</a>
          </a-form-item>
        </a-col>
      </a-row>
      <a-button type="primary" @click="handleAdd">Stock Adjustment</a-button>
    </a-card>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStockTakeStore } from '~/stores/StockTakeStore.js';
import StockAdjustmentForm from "~/components/inventory/stockTake/stock adjustment/StockAdjustmentForm.vue";


const stockTakeStore = useStockTakeStore();
const stockTake = ref(null);
const loading = ref(true);
const open = ref(false);
const props = defineProps({
  stock_take_id: {
    type: Number,
    required: true,
  },
});
const fetchStockTake = async () => {
  try {
    stockTake.value = stockTakeStore.StockTakeById(parseInt(props.stock_take_id));
  } catch (error) {
    console.error('Failed to fetch stock take:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStockTake();
  console.log("stockTake",stockTake.value)
});
const handleAdd = () => {
  open.value = true;
};
const handleOk = () => {
  open.value = false;
  // Optionally handle any additional logic here
};
const handleCancel = () => {
  open.value = false;
};
const handleSubmitSuccess = () => {
  open.value = false;
};
</script>

<style scoped>
.stock-take-detail {
  padding: 24px;
}
</style>
