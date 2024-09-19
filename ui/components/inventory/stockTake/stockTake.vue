<template>
  <a-form @submit.prevent="fetchFilteredProducts">
    <a-form-item label="Store">
      <a-select v-model="filterForm.store_id" :options="stores" />
    </a-form-item>

    <a-form-item label="Warehouse">
      <a-select v-model="filterForm.warehouse_id" :options="warehouses" />
    </a-form-item>

    <a-form-item label="Category">
      <a-select v-model:value="filterForm.category_id" placeholder="Select category">
        <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="Subcategory">
      <a-select v-model:value="filterForm.subcategory_id" placeholder="Select subcategory">
        <a-select-option v-for="subcategory in subcategories" :key="subcategory.id" :value="subcategory.id">
          {{ subcategory.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-button type="primary" @click="fetchFilteredProducts">Filter Products</a-button>
  </a-form>
  <!-- Display the Stock Take form once products are fetched -->

  <stock-take-form v-if="products" :products="products" />
</template>

<script setup>
import { ref } from 'vue';
import {useStockTakeStore} from "~/stores/invetory/StockTakeStore.js";
import {PlusOutlined} from "@ant-design/icons-vue";
import {useCategoryStore} from "~/stores/product/CategoryStore.js";
import {useSubcategoryStore} from "~/stores/product/SubcategoryStore.js";
import StockTakeForm from "~/components/inventory/stockTake/stockTakeForm.vue";
const StockTakeStore = useStockTakeStore();
const categoryStore = useCategoryStore();
const subcategoryStore = useSubcategoryStore();
const stores = ref([]);
const warehouses = ref([]);
const categories = ref([]);
const subcategories = ref([]);
const filterForm = ref({
  store_id: null,
  warehouse_id: null,
  category_id: null,
  subcategory_id: null,
});

const products = ref([]);

const fetchFilteredProducts =  async () => {
  console.log("filterForm.value", filterForm.value)
  products.value = await StockTakeStore.stockTakeForm(filterForm.value);
};
// Fetch categories and subcategories
categoryStore.fetchCategories().then(() => {
  categories.value = categoryStore.categories;
});
subcategoryStore.fetchSubcategories().then(() => {
  subcategories.value = subcategoryStore.subcategories;
});
</script>
