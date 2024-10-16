<template>
  <div class="expense-edit-modal">
    <h3 style="margin-top: 0">Edit Expense</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" :form="form" @submit.prevent="updateExpense">
      <a-form-item label="Expense Category" :rules="[{ required: true, message: 'Please select an expense category' }]">
        <a-select v-model:value="form.expenseCategoryId" placeholder="Select an expense category">
          <a-select-option v-for="category in categoryStore.expenseCategories" :key="category.id" :value="category.id">
            {{ category.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Date of Expense" :rules="[{ required: true, message: 'Please select a date' }]">
        <a-date-picker v-model:date="form.date" :format="dateFormat" placeholder="Select date" />
      </a-form-item>

      <a-form-item label="Amount" :rules="[{ required: true, message: 'Please enter the amount' }]">
        <a-input-number v-model:value="form.amount" placeholder="Enter amount" :min="0" />
      </a-form-item>

      <a-form-item label="Description" :rules="[{ required: true, message: 'Please input your description!' }]">
        <a-textarea :rows="4" v-model:value="form.description" placeholder="Enter description" />
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
        <a-button type="primary" :loading="loading" html-type="submit" block size="large">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useExpenseStore } from '~/stores/expenses/expenseStore.js';
import { useExpenseCategoryStore } from '~/stores/expenses/ExpenseCategory.js';
import { usePaymentMethodStore } from '~/stores/PaymentMethodStore.js';
import { useSupplierStore } from '~/stores/product/SupplierStore.js';
import { useUserStore } from '~/stores/UserStore.js';
import dayjs from 'dayjs';
const props = defineProps({
  expenseId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['submit-success']);

const expenseStore = useExpenseStore();
const categoryStore = useExpenseCategoryStore();
const paymentMethodStore = usePaymentMethodStore();
const supplierStore = useSupplierStore();
const userStore = useUserStore();
const dateFormat = 'YYYY-MM-DD';
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
const loading = ref(false);
const error = ref(null);

const fetchExpense = async () => {
  try {
    loading.value = true;
    const expense = await expenseStore.ExpenseById(props.expenseId);
    if (expense) {
      form.value = { ...expense };
    } else {
      error.value = 'Expense not found';
    }
  } catch (error) {
    error.value = error.message || 'Failed to load Expense';
  } finally {
    loading.value = false;
  }
};

const fetchData = async () => {
  try {
    await categoryStore.fetchExpenseCategories();
    await paymentMethodStore.fetchPaymentMethods();
    await supplierStore.fetchSuppliers();
    await userStore.fetchUsers();
    await fetchExpense();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
const expenseId = ref(null)
watch(() => props.expenseId, (newexpenseId) => {
  expenseId.value = newexpenseId;
  fetchData();
}, { immediate: true });
onMounted(fetchData);

const updateExpense = async () => {
  try {
    loading.value = true;
    await expenseStore.updateExpense(props.expenseId, form.value);
    if (expenseStore.error) {
      error.value = expenseStore.error;
    } else {
      emit('submit-success');
    }
  } catch (err) {
    error.value = err.message || 'Failed to update expense';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
