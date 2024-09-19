<template>
  <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
    <a-form-item label="Coupon Code" :rules="[{ required: true, message: 'Please input the coupon code!' }]">
      <a-input v-model:value="form.code" />
    </a-form-item>

    <a-form-item label="Discount Type" :rules="[{ required: true, message: 'Please select a discount type!' }]">
      <a-select v-model:value="form.discountType" placeholder="Select discount type">
        <a-select-option value="percentage">Percentage</a-select-option>
        <a-select-option value="fixed_amount">Fixed Amount</a-select-option>
        <a-select-option value="buy_x_get_y">Buy X Get Y</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="Discount Value" :rules="[{ required: true, message: 'Please input the discount value!' }]">
      <a-input-number v-model:value="form.discountValue" :min="0" style="width: 100%" />
    </a-form-item>

    <a-form-item label="Minimum Purchase Amount">
      <a-input-number v-model:value="form.minimumPurchaseAmount" :min="0" style="width: 100%" />
    </a-form-item>

    <a-form-item label="Expiry Date" :rules="[{ required: true, message: 'Please select an expiry date!' }]">
      <a-date-picker v-model:value="form.expiryDate" style="width: 100%" />
    </a-form-item>

    <a-form-item label="Usage Limit">
      <a-input-number v-model:value="form.usageLimit" :min="0" style="width: 100%" />
    </a-form-item>

    <a-form-item label="Customer Limit">
      <a-input-number v-model:value="form.customerLimit" :min="0" style="width: 100%" />
    </a-form-item>

    <a-form-item label="Applicable To">
      <a-select v-model:value="form.applicableTo" placeholder="Select applicable category" @change="handleApplicableToChange">
        <a-select-option value="product">Product</a-select-option>
        <a-select-option value="variant">Variant</a-select-option>
        <a-select-option value="category">Category</a-select-option>
        <a-select-option value="subcategory">Subcategory</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="Applicable ID" v-if="form.applicableTo && applicableOptions.length">
      <a-select v-model:value="form.applicableId" placeholder="Select applicable item">
        <a-select-option v-for="option in applicableOptions" :key="option.id" :value="option.id">
          {{ option?.name || option?.sku }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="Customer Restrictions (IDs)">
      <a-textarea v-model:value="form.customerRestrictions" placeholder="Enter comma-separated customer IDs" />
    </a-form-item>

    <a-form-item label="Description">
      <a-textarea v-model:value="form.description" rows="4" />
    </a-form-item>

    <a-form-item label="Status" :rules="[{ required: true, message: 'Please select a status!' }]">
      <a-select v-model:value="form.status">
        <a-select-option value="active">Active</a-select-option>
        <a-select-option value="expired">Expired</a-select-option>
        <a-select-option value="disabled">Disabled</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item>
      <a-button type="primary" :loading="loading" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref } from 'vue';
import { useCouponStore } from '~/stores/CouponStore.js';
import {useSubcategoryStore} from "~/stores/product/SubcategoryStore.js"; // Adjust path to your store
const couponStore = useCouponStore();
const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const subCategoryStore = useSubcategoryStore();
productStore.fetchProducts();
productStore.fetchVariants();
categoryStore.fetchCategories();
subCategoryStore.fetchSubcategories();

const loading = ref(false);
const applicableOptions = ref([]); // Will hold the dynamically fetched options
const form = ref({
  code: '',
  discountType: null,
  discountValue: null,
  minimumPurchaseAmount: null,
  expiryDate: null,
  usageLimit: null,
  customerLimit: null,
  applicableTo: null,
  applicableId: null,
  customerRestrictions: '',
  description: '',
  status: 'active',
});

// Function to handle applicableTo change
const handleApplicableToChange = async (value) => {
  applicableOptions.value = []; // Clear previous options
  form.value.applicableId = null; // Reset applicableId

  if (value === 'product') {
    applicableOptions.value =  productStore.products;
  } else if (value === 'category') {
    applicableOptions.value =  categoryStore.categories;
  } else if (value === 'variant') {
    applicableOptions.value =  productStore.variants;
  } else if (value === 'subcategory') {
    applicableOptions.value =  subCategoryStore.subcategories;
  }
};

const handleSubmit = async () => {
  try {
    // Validate that all required fields are filled
    if (!form.value.code || !form.value.discountType || form.value.discountValue === null || !form.value.expiryDate) {
      throw new Error('All required fields must be filled.');
    }

    loading.value = true;

    // Call the store method to add the coupon
    await couponStore.createCoupon({
      code: form.value.code,
      discountType: form.value.discountType,
      discountValue: form.value.discountValue,
      minimumPurchaseAmount: form.value.minimumPurchaseAmount,
      expiryDate: form.value.expiryDate,
      usageLimit: form.value.usageLimit,
      customerLimit: form.value.customerLimit,
      applicableTo: form.value.applicableTo,
      applicableId: form.value.applicableId,
      customerRestrictions: form.value.customerRestrictions.split(',').map(id => id.trim()), // Converting comma-separated values to array
      description: form.value.description,
      status: form.value.status,
    });

    // Reset form
    form.value = {
      code: '',
      discountType: null,
      discountValue: null,
      minimumPurchaseAmount: null,
      expiryDate: null,
      usageLimit: null,
      customerLimit: null,
      applicableTo: null,
      applicableId: null,
      customerRestrictions: '',
      description: '',
      status: 'active',
    };

    // Emit event to close the modal if needed
    emit('submit-success');
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error('Error adding Coupon:', error);
    // Optionally, show an error message to the user
    //$toast.error('Error Creating Coupon');
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
