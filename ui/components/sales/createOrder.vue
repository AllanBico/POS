<template>
  <div>
    <a-form @submit="handleSubmit">
      <!-- Customer Selection -->
      <a-form-item label="Customer">
        <a-select
            v-model:value="saleData.customer_id"
            placeholder="Select Customer"
            allowClear
        >
          <a-select-option :value="null">None</a-select-option>
          <a-select-option
              v-for="customer in customers"
              :key="customer.id"
              :value="customer.id"
          >
            {{ customer.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- Table to display the products added dynamically -->
      <a-table
          :columns="columns"
          :dataSource="saleData.lineItems"
          :pagination="false"
          rowKey="id"
          bordered
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column?.dataIndex === 'variantId'">
            <a-select
                v-model:value="record.variantId"
                placeholder="Select Product"
                show-search
                :filter-option="filterOption"
                @change="() => updateLineItem(record)"
            >
              <a-select-option
                  v-for="variant in products"
                  :key="variant.id"
                  :value="variant.id"
              >
                {{ variant.sku }} ({{ variant.Product.name }})
              </a-select-option>
            </a-select>
          </template>

          <template v-else-if="column?.dataIndex === 'quantity'">
            <a-input-number
                v-model:value="record.quantity"
                min="1"
                placeholder="Enter quantity"
                @change="() => updateLineItem(record)"
            />
          </template>

          <template v-else-if="column?.dataIndex === 'price'">
<!--            <a-input-number-->
<!--                v-model:value="record.price"-->
<!--                min="0"-->
<!--                placeholder="Enter price"-->
<!--                @change="updateTotalPrice(record)"-->
<!--            />-->
            {{record.price}}
          </template>

          <template v-else-if="column?.dataIndex === 'totalPrice'">
            {{ record.totalPrice }}
          </template>

          <template v-else-if="column?.dataIndex === 'action'">
            <a-button @click="removeItem(record.id)" type="danger" icon="delete">
              Remove
            </a-button>
          </template>
        </template>
      </a-table>

      <!-- Add Product Button -->
      <a-form-item>
        <a-button @click="addProduct">Add Product</a-button>
      </a-form-item>

      <!-- Total Calculation -->
      <a-form-item label="Total">
        <a-input v-model="saleData.total" readonly />
      </a-form-item>

      <!-- Submit Button -->
      <a-form-item>
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js';
import { useCustomerStore } from '~/stores/CustomerStore.js'; // Assuming you have a customer store

// Move computed properties to the top for better organization
const products = computed(() => productStore.variants);
const customers = computed(() => customerStore.customers);

// Separate data initialization
const initSaleData = () => ({
  customer_id: null, // Allow null for no customer
  lineItems: [],
  total: 0,
});

const saleData = ref(initSaleData());

// Table columns
const columns = [
  { title: 'Product', dataIndex: 'variantId', key: 'variantId' },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
  { title: 'Price', dataIndex: 'price', key: 'price' },
  { title: 'Total Price', dataIndex: 'totalPrice', key: 'totalPrice' },
  { title: 'Action', dataIndex: 'action', key: 'action' },
];

// Stores
const productStore = useProductStore();
productStore.fetchVariants();

const customerStore = useCustomerStore();
customerStore.fetchCustomers(); // Assuming you have a fetch function for customers

// Add a new product row to the table
const addProduct = () => {
  saleData.value.lineItems.push({
    id: Date.now(),
    variantId: null,
    quantity: 1,
    price: 0,
    totalPrice: 0, // Initialize with 0
  });
};

// Combine handleProductSelect and handleQuantityChange into a single function
const updateLineItem = (item) => {
  const product = products.value.find(p => p.id === item.variantId);
  if (product) {
    item.price = product.price;
    item.totalPrice = product.price * item.quantity;
    updateTotal();
  }
};

// Remove a product row
const removeItem = (id) => {
  saleData.value.lineItems = saleData.value.lineItems.filter(item => item.id !== id);
  updateTotal();
};

// Update the total for all line items
const updateTotal = () => {
  saleData.value.total = saleData.value.lineItems.reduce(
      (total, item) => total + item.totalPrice, 0
  );
};

// Handle form submission
const handleSubmit = async () => {
  try {
    const salesOrderStore = useSalesOrderStore();
    const result = await salesOrderStore.createOrder(saleData.value);
    console.log('Sale submitted successfully:', result);
    // Reset form after successful submission
    saleData.value = initSaleData();
  } catch (error) {
    console.error('Error submitting sale:', error);
    // Show error message to user
    // You might want to use a toast or notification component here
  }
};

// Add a new method for filtering options in the product select
const filterOption = (input, option) => {
  return option.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
</script>
