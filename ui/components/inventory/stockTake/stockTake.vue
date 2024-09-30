<template>
  <div v-if="!products" class="stock-take-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Stock Take"
        sub-title="Filter and manage your inventory count"
      >
        <template #extra>
          <a-button type="primary" @click="fetchFilteredProducts">
            <template #icon><SearchOutlined /></template>
            Filter Products
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <div class="content-container">
      <a-card class="filter-card" :bordered="false">
        <a-form layout="vertical" @submit.prevent="fetchFilteredProducts">
          <a-row :gutter="16">
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item label="Store">
                <a-select v-model:value="filterForm.store_id" placeholder="Select store">
                  <a-select-option v-for="store in stores" :key="store.id" :value="store.id">
                    {{ store.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item label="Warehouse">
                <a-select v-model:value="filterForm.warehouse_id" placeholder="Select warehouse">
                  <a-select-option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                    {{ warehouse.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item label="Category">
                <a-select v-model:value="filterForm.category_id" placeholder="Select category">
                  <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-form-item label="Subcategory">
                <a-select v-model:value="filterForm.subcategory_id" placeholder="Select subcategory">
                  <a-select-option v-for="subcategory in subcategories" :key="subcategory.id" :value="subcategory.id">
                    {{ subcategory.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>


    </div>
  </div>
  <stock-take-form v-if="products" :productData="products" class="stock-take-form" />
</template>

<script setup>
import { ref } from 'vue';
import { useStockTakeStore } from "~/stores/invetory/StockTakeStore.js";
import { useCategoryStore } from "~/stores/product/CategoryStore.js";
import { useSubcategoryStore } from "~/stores/product/SubcategoryStore.js";
import StockTakeForm from "~/components/inventory/stockTake/stockTakeForm.vue";
import { SearchOutlined } from "@ant-design/icons-vue";

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

const products = ref(null);

const fetchFilteredProducts = async () => {
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

<style scoped>
.stock-take-container {
  background-color: #f0f2f5;
  padding: 24px;
  border-radius: 12px;
}

.header-card {
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.header {
  padding: 24px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.filter-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

:deep(.ant-form-item-label) {
  font-weight: 600;
  margin-bottom: 8px;
}

:deep(.ant-select-selector) {
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

:deep(.ant-btn) {
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 40px;
  font-weight: 500;
}


@media (max-width: 768px) {
  .stock-take-container {
    padding: 16px;
  }

  .header-card,
  .filter-card {
    padding: 16px;
  }
}
</style>
