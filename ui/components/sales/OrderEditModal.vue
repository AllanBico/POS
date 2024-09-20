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
                @change="handleProductSelect(record)"
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
                @change="handleQuantityChange(record)"
            />
          </template>

          <template v-else-if="column?.dataIndex === 'price'">
            {{ record.price }}
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
        <a-button type="primary" html-type="submit">Update Order</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js';
import { useCustomerStore } from '~/stores/CustomerStore.js'; // Assuming you have a customer store

const emit = defineEmits(['submit-success']);
// Props
const props = defineProps({
  orderId: {
    type: Number,
    required: true,
  }
});

// Sale data
const saleData = ref({
  customer_id: null,
  lineItems: [],
  total: 0,
});

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
const products = computed(() => productStore.variants);
productStore.fetchVariants();

const customerStore = useCustomerStore();
const customers = computed(() => customerStore.customers);
customerStore.fetchCustomers(); // Assuming you have a fetch function for customers

const salesOrderStore = useSalesOrderStore();

// Fetch order details on component mount
onMounted(async () => {
  await fetchOrderDetails();
});

// Fetch the order details by orderId and populate the form
const fetchOrderDetails = async () => {
  try {
    const order = await salesOrderStore.fetchOrderById(props.orderId);
    console.log("order",order)
    saleData.value.customer_id = order.customerId;
    saleData.value.lineItems = order.lineItems.map(item => ({
      ...item,
      totalPrice: item.price * item.quantity,
    }));
    updateTotal();
  } catch (error) {
    console.error('Error fetching order:', error);
  }
};

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

// Handle product selection and update price
const handleProductSelect = (item) => {
  const product = products.value.find(p => p.id === item.variantId);
  if (product) {
    item.price = product.price;
    item.totalPrice = product.price * item.quantity;
    updateTotal();
  }
};

// Handle quantity change
const handleQuantityChange = (item) => {
  item.totalPrice = item.price * item.quantity;
  updateTotal();
};

// Update the total price for a line item
const updateTotalPrice = (item) => {
  item.totalPrice = item.price * item.quantity;
  updateTotal();
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

// Handle form submission to update the order
const handleSubmit = async () => {
  try {
    console.log("saleData.value", saleData.value);
    const result = await salesOrderStore.updateOrder(props.orderId, saleData.value);
    console.log('Order updated successfully:', result);
    emit('submit-success');
  } catch (error) {
    console.error('Error updating order:', error);
    // Add error feedback
  }
};
</script>
