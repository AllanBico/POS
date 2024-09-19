<template>
  <a-form @submit="handleSubmit">
    <a-form-item label="Customer">
      <a-input v-model="saleData.customer_name" placeholder="Enter customer name" />
    </a-form-item>

    <a-form-item label="Products">
      <a-select v-model="selectedProduct" placeholder="Select product" @change="handleProductSelect">
        <a-select-option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="Quantity">
      <a-input-number v-model="saleData.quantity" min="1" />
    </a-form-item>

    <a-form-item label="Total">
      <a-input v-model="saleData.total" readonly />
    </a-form-item>

    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref } from 'vue';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js'; // Assuming there's a product store

// Sale data
const saleData = ref({
  customer_name: '',
  product_id: null,
  quantity: 1,
  total: 0,
});

// Product selection
const selectedProduct = ref(null);
const products = useProductStore().products; // Fetch products from store

// Handle product selection
const handleProductSelect = (productId) => {
  saleData.value.product_id = productId;
  const product = products.find(p => p.id === productId);
  saleData.value.total = product.price * saleData.value.quantity;
};

// Handle form submission
const handleSubmit = () => {
  console.log('Sale submitted:', saleData.value);
};
</script>
