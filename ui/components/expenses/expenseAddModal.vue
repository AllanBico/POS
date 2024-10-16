<template>
  <div class="expense-add-modal">
    <h3 style="margin-top: 0">Add Expense</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
      <a-form-item
        label="Expense Category"
        :rules="[{ required: true, message: 'Please select an expense category' }]"
      >
        <a-select v-model:value="form.expenseCategoryId" placeholder="Select an expense category">
          <a-select-option v-for="category in categoryStore.expenseCategories" :key="category.id" :value="category.id">
            {{ category.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Date of Expense" :rules="[{ required: true, message: 'Please select a date' }]">
        <a-date-picker v-model:value="form.date" placeholder="Select date" />
      </a-form-item>

      <a-form-item label="Amount" :rules="[{ required: true, message: 'Please enter the amount' }]">
        <a-input-number v-model:value="form.amount" placeholder="Enter amount" :min="0" />
      </a-form-item>

      <a-form-item label="Description">
        <a-input v-model:value="form.description" placeholder="Enter description" />
      </a-form-item>

      <a-form-item label="Reference Number">
        <a-input v-model:value="form.referenceNumber" placeholder="Enter reference number" />
      </a-form-item>

      <a-form-item label="Payment Method" :rules="[{ required: true, message: 'Please select a payment method' }]">
        <a-select v-model:value="form.paymentMethodId" placeholder="Select a payment method">
          <a-select-option v-for="method in paymentMethodStore.paymentMethods" :key="method.id" :value="method.id">
            {{ method.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Paid By" :rules="[{ required: true, message: 'Please select a user' }]">
        <a-select v-model:value="form.paidById" placeholder="Select a user">
          <a-select-option v-for="user in userStore.users" :key="user.id" :value="user.id">
            {{ user.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Supplier (Optional)">
        <a-select v-model:value="form.supplierId" placeholder="Select a supplier" allow-clear>
          <a-select-option v-for="supplier in supplierStore.suppliers" :key="supplier.id" :value="supplier.id">
            {{ supplier.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" :loading="expenseStore.loading" html-type="submit" block size="large">
          <template #icon><PlusOutlined /></template>
          Add Expense
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useExpenseStore } from '~/stores/expenses/expenseStore.js';
import { useExpenseCategoryStore } from '~/stores/expenses/ExpenseCategory.js'; // Assuming the store for categories
import { usePaymentMethodStore } from '~/stores/PaymentMethodStore.js'; // Assuming the store for payment methods
import { useSupplierStore } from '~/stores/product/SupplierStore.js'; // Assuming the store for suppliers
import { PlusOutlined } from '@ant-design/icons-vue';
const emit = defineEmits(['submit-success']);
const form = ref({
  expenseCategoryId: null,
  date: null,
  amount: null,
  description: '',
  referenceNumber: '',
  paymentMethodId: null,
  paidById: null,
  supplierId: null
});

const expenseStore = useExpenseStore();
const categoryStore = useExpenseCategoryStore();
const paymentMethodStore = usePaymentMethodStore();
const supplierStore = useSupplierStore();
const userStore = useUserStore()
const fetchData = async () => {
  try {
    await categoryStore.fetchExpenseCategories();
    await paymentMethodStore.fetchPaymentMethods();
    await supplierStore.fetchSuppliers();
    await userStore.fetchUsers();
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};
fetchData()


const handleSubmit = async () => {
  try {
    console.log("form.value",form.value)
    await expenseStore.createExpense(form.value);
    form.value = {
      expenseCategoryId: null,
      date: null,
      amount: null,
      description: '',
      referenceNumber: '',
      paymentMethodId: null,
      paidById: null,
      supplierId: null
    };
    emit('submit-success');
  } catch (error) {
    console.error('Error adding expense:', error);
  }
};

</script>


<style scoped>
/* Add any custom styles if needed */
</style>
