<template>
  <a-form layout="vertical" :form="form" @submit.prevent="handleSubmit">
    <!-- Other fields remain the same -->

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
      <a-input-number v-model:value="form.discountValue" min="0" />
    </a-form-item>

    <a-form-item label="Minimum Purchase Amount">
      <a-input-number v-model:value="form.minimumPurchaseAmount" min="0" />
    </a-form-item>

    <a-form-item label="Expiry Date" :rules="[{ required: true, message: 'Please select an expiry date!' }]" >
      <a-date-picker v-model:value="form.expiryDate"  value-format="YYYY-MM-DD"/>
    </a-form-item>

    <a-form-item label="Applicable To">
      <a-select v-model:value="form.applicableTo" @change="handleApplicableToChange">
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

    <a-form-item>
      <a-button type="primary" :loading="loading" html-type="submit">Update</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCouponStore } from '~/stores/CouponStore'; // Assuming a store for managing coupons
import { useProductStore } from '~/stores/ProductStore';  // Example store for products
import { useCategoryStore } from '~/stores/CategoryStore';
import {useSubcategoryStore} from "~/stores/SubcategoryStore.js"; // Example store for categories

const props = defineProps({
  couponId: {
    type: Number,
    required: true,
  },
});
const subCategoryStore = useSubcategoryStore();
const couponStore = useCouponStore();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
productStore.fetchProducts();
productStore.fetchVariants();
categoryStore.fetchCategories();
subCategoryStore.fetchSubcategories();


const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();
const loading = ref(false);
const applicableOptions = ref([]);

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

// Fetch existing coupon data when component mounts
onMounted(async () => {
  if (props.couponId) {
    loading.value = true;
    try {
      const coupon =  couponStore.CouponById(parseInt(props.couponId));
      form.value = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumPurchaseAmount: coupon.minimumPurchaseAmount,
        expiryDate: coupon.expiryDate,
        usageLimit: coupon.usageLimit,
        customerLimit: coupon.customerLimit,
        applicableTo: coupon.applicableTo,
        applicableId: coupon.applicableId,
        customerRestrictions: coupon.customerRestrictions ? coupon.customerRestrictions.join(', ') : '',
        description: coupon.description,
        status: coupon.status,
      };
      await handleApplicableToChange(form.value.applicableTo); // Fetch applicable options based on current value
    } catch (error) {
      console.error('Error fetching coupon:', error);
    } finally {
      loading.value = false;
    }
  }
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
    if (!form.value.code || !form.value.discountType || form.value.discountValue === null || !form.value.expiryDate) {
      throw new Error('All required fields must be filled.');
    }

    loading.value = true;

    // Call store method to update the coupon
    await couponStore.updateCoupon(props.couponId, {
      code: form.value.code,
      discountType: form.value.discountType,
      discountValue: form.value.discountValue,
      minimumPurchaseAmount: form.value.minimumPurchaseAmount,
      expiryDate: form.value.expiryDate,
      usageLimit: form.value.usageLimit,
      customerLimit: form.value.customerLimit,
      applicableTo: form.value.applicableTo,
      applicableId: form.value.applicableId,
      customerRestrictions: form.value.customerRestrictions.split(',').map(id => id.trim()),
      description: form.value.description,
      status: form.value.status,
    });

    // Emit event to notify successful update
    emit('submit-success');
    loading.value = false;
  } catch (error) {
    loading.value = false;
    console.error('Error updating Coupon:', error);
    // Optionally, show an error message to the user
    //$toast.error('Error Updating Coupon');
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
