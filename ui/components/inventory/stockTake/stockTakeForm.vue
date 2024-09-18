<template>
  <a-form @submit.prevent="submitStockTake">
    <!-- Regular HTML table for stock take -->
    <table class="stock-take-table" style="width: 100%;">
      <thead>
      <tr>
        <th>Product Name</th>
        <th>Variant SKU</th>
        <th>Current Stock</th>
        <th>Counted Quantity</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(product, productKey) in products" :key="productKey">
        <template v-for="(variant, variantKey) in product.variants" :key="variantKey">
          <tr>
            <td>{{ product.product.name }}</td>
            <td>{{ variant.variant.sku }}</td>
            <td>{{ variant.inventory.quantity }}</td>
            <td>
              <input
                  type="number"
                  v-model="variant.physicalQuantity"
                  min="0"
                  class="stock-take-input"
              />
            </td>
          </tr>
        </template>
      </tr>
      </tbody>
    </table>

    <a-button type="primary" @click="submitStockTake" style="margin-top: 16px;">
      Submit Stock Take
    </a-button>
  </a-form>
</template>

<script setup>
import { ref } from 'vue';
import {useStockTakeStore} from "~/stores/StockTakeStore.js";
const StockTakeStore = useStockTakeStore();
// Accept products as a prop
const props = defineProps({
  products: {
    type: Object,
    required: true,
  },
});

// Submit the stock take
// Submit the stock take
const submitStockTake = async () => {
  // Prepare the stock take data
  const stockTakeData = [];

  for (const productKey in props.products) {
    const product = props.products[productKey];

    product.variants.forEach(variant => {
      stockTakeData.push({
        variantId: variant.variant.id,
        physicalQuantity: variant.physicalQuantity,
        systemQuantity: variant.inventory.quantity,
        warehouseId: variant?.inventory?.warehouse?.id,
        storeId: variant?.inventory?.store?.id,
      });
    });
  }

  // Log stock take data for debugging (replace with actual API call)
  console.log("Stock Take Data to Submit: ", stockTakeData);

  await StockTakeStore.createStockTake(stockTakeData)
};
</script>

<style scoped>
.stock-take-table {
  width: 100%;
  border-collapse: collapse;
}

.stock-take-table th,
.stock-take-table td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}

.stock-take-table th {
  background-color: #f0f0f0;
}

.stock-take-input {
  width: 100px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>