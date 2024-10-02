<template>
  <div class="sales-order-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Create Sales Order"
        sub-title="Create and manage your sales orders"
      >
        <template #extra>
          <a-button
            class="submit-order-btn"
            type="primary"
            @click="handleSubmit"
            :icon="h(SaveOutlined)"
          >
            Submit Order
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <div class="content-container">
      <a-card class="form-card" :bordered="false">
        <a-form layout="vertical" @submit.prevent="handleSubmit">
          <a-row :gutter="16">
            <a-col :xs="24" :sm="12">
              <a-form-item label="Customer">
                <a-select
                  v-model:value="saleData.customer_id"
                  placeholder="Select Customer"
                  allowClear
                  show-search
                  :filter-option="filterOption"
                  :options="customerOptions"
                >
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>

      <a-card class="table-card" :bordered="false">
        <template #title>
          <div class="table-header">
            <h3>Order Items</h3>
            <a-button
              type="primary"
              @click="addProduct"
              :icon="h(PlusOutlined)"
            >
              Add Product
            </a-button>
          </div>
        </template>
        <a-table
          :columns="columns"
          :dataSource="saleData.lineItems"
          :pagination="false"
          :rowKey="(record) => record.id"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'variantId'">
              <a-select
                v-model:value="record.variantId"
                placeholder="Select Product"
                show-search
                :filter-option="filterOption"
                @change="(value) => updateLineItem(record, value)"
                style="width: 100%;"
                :options="productOptions"
              >
              </a-select>
            </template>

            <template v-else-if="column.dataIndex === 'quantity'">
              <a-input-number
                v-model:value="record.quantity"
                :min="1"
                placeholder="Enter quantity"
                @change="() => updateLineItem(record)"
                style="width: 100%;"
              />
            </template>

            <template v-else-if="column.dataIndex === 'price'">
              {{ record.price }}
            </template>

            <template v-else-if="column.dataIndex === 'discount'">
              <a-space>
                <a-input-number
                  v-model:value="record.discount"
                  :min="0"
                  :max="record.discountType === 'percentage' ? 100 : undefined"
                  placeholder="Discount"
                  @change="() => updateLineItem(record)"
                  style="width: 100px;"
                />
                <a-select
                  v-model:value="record.discountType"
                  style="width: 80px;"
                  @change="() => updateLineItem(record)"
                >
                  <a-select-option value="percentage">%</a-select-option>
                  <a-select-option value="fixed">$</a-select-option>
                </a-select>
              </a-space>
            </template>

            <template v-else-if="column.dataIndex === 'totalPrice'">
              {{ record.totalPrice }}
            </template>

            <template v-else-if="column.dataIndex === 'serialNumbers'">
              <a-select
                v-model:value="record.selectedSerialNumbers"
                mode="multiple"
                placeholder="Select Serial Numbers"
                :disabled="!record.variantId"
                @change="() => updateLineItem(record)"
                style="width: 100%;"
                :options="record.availableSerialNumbers.map(sn => ({
                  value: sn.id,
                  label: sn.serialNumber
                }))"
                :filter-option="filterOption"
              >
              </a-select>
            </template>

            <template v-else-if="column.dataIndex === 'action'">
              <a-button
                type="link"
                danger
                @click="removeItem(record.id)"
                :icon="h(DeleteOutlined)"
              >
              </a-button>
            </template>
          </template>
        </a-table>
      </a-card>

      <a-card class="summary-card" :bordered="false">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="8">
            <a-form-item label="Coupon Code">
              <a-input v-model:value="saleData.couponCode" placeholder="Enter coupon code" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-form-item label="Order Discount">
              <a-space>
                <a-input-number
                  v-model:value="saleData.discount"
                  :min="0"
                  :max="saleData.discountType === 'percentage' ? 100 : undefined"
                  placeholder="Enter discount"
                  @change="updateTotal"
                  style="width: 120px;"
                />
                <a-select
                  v-model:value="saleData.discountType"
                  style="width: 80px;"
                  @change="updateTotal"
                >
                  <a-select-option value="percentage">%</a-select-option>
                  <a-select-option value="fixed">$</a-select-option>
                </a-select>
              </a-space>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-form-item label="Payment Method">
              <a-select
                v-model:value="saleData.paymentMethod"
                placeholder="Select payment method"
                style="width: 100%;"
                :options="paymentOptions"
                :filter-option="filterOption"
              >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-statistic
              title="Total Amount"
              :value="saleData.total"
              :precision="2"
              suffix="USD"
              style="margin-top: 16px"
            >
              <template #prefix>
                <DollarOutlined />
              </template>
            </a-statistic>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js';
import { useCustomerStore } from '~/stores/CustomerStore.js';
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined
} from '@ant-design/icons-vue';
import {usePaymentMethodStore} from "~/stores/PaymentMethodStore.js";
import {useSerialNumberStore} from "~/stores/SerialNumberStore.js";

const productStore = useProductStore();
const customerStore = useCustomerStore();
const salesOrderStore = useSalesOrderStore();
const paymentMethodStore = usePaymentMethodStore()
const serialNumberStore = useSerialNumberStore();


productStore.fetchVariants();
customerStore.fetchCustomers();
paymentMethodStore.fetchPaymentMethods()
const products = computed(() => productStore.variants);
const customers = computed(() => customerStore.customers);
const payments = computed(() => paymentMethodStore.paymentMethods);

// Create options for select components
const customerOptions = computed(() =>
  customers.value.map(customer => ({
    value: customer.id,
    label: customer.name
  }))
);

const productOptions = computed(() =>
  products.value.map(variant => ({
    value: variant.id,
    label: `${variant.sku} (${variant.Product.name})`
  }))
);

const paymentOptions = computed(() =>
  payments.value.map(payment => ({
    value: payment.id,
    label: payment.name
  }))
);

const initSaleData = () => ({
  customer_id: null,
  lineItems: [],
  total: 0,
  couponCode: '',
  discount: 0,
  discountType: 'percentage',
  paymentMethod: null,
});

const saleData = ref(initSaleData());

const columns = [
  { title: 'Product', dataIndex: 'variantId', key: 'variantId' },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
  { title: 'Price', dataIndex: 'price', key: 'price' },
  { title: 'Discount', dataIndex: 'discount', key: 'discount' },
  { title: 'Total Price', dataIndex: 'totalPrice', key: 'totalPrice' },
  { title: 'Serial Numbers', dataIndex: 'serialNumbers', key: 'serialNumbers' },
  { title: 'Action', dataIndex: 'action', key: 'action' },
];

const addProduct = () => {
  saleData.value.lineItems.push({
    id: Date.now(),
    variantId: null,
    quantity: 1,
    price: 0,
    discount: 0,
    discountType: 'percentage',
    totalPrice: 0,
    availableSerialNumbers: [],
    selectedSerialNumbers: [],
  });
};

const updateLineItem = async (item, variantId = null) => {
  const product = products.value.find(p => p.id === (variantId || item.variantId));
  if (product) {
    item.price = product.price;
    let discountAmount = item.discountType === 'percentage' 
      ? item.price * (item.discount / 100)
      : item.discount;
    item.totalPrice = (item.price - discountAmount) * item.quantity;

    if (variantId) {
      item.availableSerialNumbers = await serialNumberStore.fetchSerialNumbersByVariantId(variantId);
      item.selectedSerialNumbers = [];
    }

    // Ensure the number of selected serial numbers matches the quantity
    if (item.selectedSerialNumbers.length > item.quantity) {
      item.selectedSerialNumbers = item.selectedSerialNumbers.slice(0, item.quantity);
    }

    updateTotal();
  }
};

const removeItem = (id) => {
  saleData.value.lineItems = saleData.value.lineItems.filter(item => item.id !== id);
  updateTotal();
};

const updateTotal = () => {
  let subtotal = saleData.value.lineItems.reduce(
    (total, item) => total + item.totalPrice, 0
  );
  let orderDiscountAmount = saleData.value.discountType === 'percentage'
    ? subtotal * (saleData.value.discount / 100)
    : saleData.value.discount;
  saleData.value.total = subtotal - orderDiscountAmount;
};

const handleSubmit = async () => {
  try {
    const orderData = {
      ...saleData.value,
      lineItems: saleData.value.lineItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        discountType: item.discountType,
        totalPrice: item.totalPrice,
        selectedSerialNumbers: item.selectedSerialNumbers
      }))
    };
    const result = await salesOrderStore.createOrder(orderData);
    console.log('Sale submitted successfully:', result);
    saleData.value = initSaleData();
  } catch (error) {
    console.error('Error submitting sale:', error);
  }
};

const filterOption = (input, option) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};
</script>

<style scoped>
.sales-order-container {
  background-color: #f0f2f5;
  padding: 24px;
  border-radius: 8px;
}

.header-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header {
  padding: 16px;
}

.submit-order-btn {
  font-size: 14px;
  height: 36px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card,
.table-card,
.summary-card {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

:deep(.ant-form-item-label) {
  font-weight: 600;
  margin-bottom: 8px;
}

:deep(.ant-select-selector),
:deep(.ant-input-number),
:deep(.ant-input) {
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  width: 100%;
}

:deep(.ant-btn) {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .sales-order-container {
    padding: 16px;
  }

  .form-card,
  .table-card,
  .summary-card {
    padding: 16px;
  }
}
</style>