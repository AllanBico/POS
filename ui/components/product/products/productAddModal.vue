<template>
  <div class="product-form-container" :key="currentStep">
    <a-steps :current="currentStep" class="steps-nav" :key="currentStep">
      <a-step title="Basic Info" />
      <a-step title="Categorization" />
      <a-step title="Inventory & Pricing" />
    </a-steps>

    <a-form @submit="handleSubmit" layout="vertical" :class="['form-container', { 'desktop': isDesktop }]">
      <div v-if="currentStep === 0" class="step-content">
        <h2 class="step-title">Basic Information</h2>
        <a-form-item label="Product Name" required>
          <a-input v-model:value="product.name" placeholder="Enter product name" />
        </a-form-item>
        <a-form-item label="Description">
          <a-textarea v-model:value="product.description" placeholder="Enter product description" :rows="4" />
        </a-form-item>
        <a-form-item label="Is Composition?">
          <a-switch v-model:checked="product.isComposition" />
        </a-form-item>
      </div>

      <div v-if="currentStep === 1" class="step-content">
        <h2 class="step-title">Categorization</h2>
        <a-form-item label="Category" required>
          <a-select v-model:value="product.categoryId" placeholder="Select category" show-search :filter-option="filterOption">
            <a-select-option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </a-select-option>
          </a-select>
          <a-button type="link" @click="handleAddCategory" class="add-new-btn">
            <plus-outlined />Add New
          </a-button>
        </a-form-item>
        <a-form-item label="Subcategory">
          <a-select v-model:value="product.subcategoryId" placeholder="Select subcategory">
            <a-select-option v-for="subcategory in subcategoryStore.subcategories" :key="subcategory.id" :value="subcategory.id">
              {{ subcategory.name }}
            </a-select-option>
          </a-select>
          <a-button type="link" @click="handleAddSubCategory" class="add-new-btn">
            <plus-outlined />Add New
          </a-button>
        </a-form-item>
        <a-form-item label="Brand">
          <a-select v-model:value="product.brandId" placeholder="Select brand">
            <a-select-option v-for="brand in brandStore.brands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </a-select-option>
          </a-select>
          <a-button type="link" @click="handleAddBrand" class="add-new-btn">
            <plus-outlined />Add New
          </a-button>
        </a-form-item>
      </div>

      <div v-if="currentStep === 2" class="step-content">
        <h2 class="step-title">Inventory & Pricing</h2>
        <div class="form-row">
          <div class="form-col">
            <a-form-item label="Unit" required>
              <a-select v-model:value="product.unitId" placeholder="Select unit">
                <a-select-option v-for="unit in unitStore.units" :key="unit.id" :value="unit.id">
                  {{ unit.name }}
                </a-select-option>
              </a-select>
              <a-button type="link" @click="handleAddUnit" class="add-new-btn">
                <plus-outlined />Add New
              </a-button>
            </a-form-item>
            <a-form-item label="Low Stock Alert">
              <a-input-number v-model:value="product.lowStockAlert" placeholder="Enter quantity" min="0" style="width: 100%" />
            </a-form-item>
          </div>
          <div class="form-col">
            <a-form-item label="VAT Type" required>
              <a-select v-model:value="product.vatType" placeholder="Select VAT type">
                <a-select-option value="inclusive">Inclusive</a-select-option>
                <a-select-option value="exclusive">Exclusive</a-select-option>
                <a-select-option value="exempted">Exempted</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="Select Taxes">
              <a-select
                v-model:value="product.selectedTaxes"
                mode="multiple"
                placeholder="Select Taxes"
                labelInValue
                :options="taxStore.taxes.map(tax => ({ label: tax.name, value: tax.id }))"
              />
            </a-form-item>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <a-button v-if="currentStep > 0" @click="prevStep">Previous</a-button>
        <a-button v-if="currentStep < 2" type="primary" @click="nextStep">Next</a-button>
        <a-button v-if="currentStep === 2" type="primary" @click="handleSubmit" :loading="productStore.loading">
          Create Product
        </a-button>
      </div>
    </a-form>

    <a-modal v-model:open="open_unit" title="Add Unit" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
      <UnitsAddModal @submit-success="handleSubmitSuccess"></UnitsAddModal>
      <template #footer> </template>
    </a-modal>
    <a-modal v-model:open="open_subcategory" title="Add SubCategory" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
      <sub-category-add-modal @submit-success="handleSubmitSuccess"></sub-category-add-modal>
      <template #footer> </template>
    </a-modal>
    <a-modal v-model:open="open_category" title="Add Category" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
      <category-add-modal @submit-success="handleSubmitSuccess"></category-add-modal>
      <template #footer> </template>
    </a-modal>
    <a-modal v-model:open="open_brand" title="Add Brand" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
      <brand-add-modal @submit-success="handleSubmitSuccess"></brand-add-modal>
      <template #footer> </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useCategoryStore } from '~/stores/product/CategoryStore.js';
import { useSubcategoryStore } from '~/stores/product/SubcategoryStore.js';
import { useAttributesStore } from '~/stores/product/AttributeStore.js';
import { useBrandStore } from '~/stores/product/BrandStore.js';
import { useUnitStore } from '~/stores/product/UnitStore.js';
import { useTaxStore } from '@/stores/taxStore.js';
import CategoryAddModal from '~/components/product/categories/categoryAddModal.vue';
import SubCategoryAddModal from '~/components/product/subcategories/subCategoryAddModal.vue';
import BrandAddModal from '~/components/product/brands/brandAddModal.vue';
import UnitsAddModal from '~/components/product/units/unitsAddModal.vue';
import { PlusOutlined } from '@ant-design/icons-vue';

const emit = defineEmits(['submit-success']);
const { $toast } = useNuxtApp();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const subcategoryStore = useSubcategoryStore();
const attributesStore = useAttributesStore();
const brandStore = useBrandStore();
const unitStore = useUnitStore();
const taxStore = useTaxStore();
const router = useRouter();

const isDesktop = ref(window.innerWidth >= 1024);
const currentStep = ref(0);

onMounted(() => {
  window.addEventListener('resize', handleResize);
  attributesStore.fetchAttributeValues();
  brandStore.fetchBrands();
  unitStore.fetchUnits();
  taxStore.fetchTaxes();
  categoryStore.fetchCategories();
  subcategoryStore.fetchSubcategories();
  attributesStore.fetchAttributes();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024;
};

const product = ref({
  name: '',
  description: '',
  categoryId: null,
  subcategoryId: null,
  vatType: 'exclusive',
  brandId: null,
  unitId: null,
  lowStockAlert: 0,
  isComposition: false,
  selectedTaxes: [],
});

const resetForm = () => {
  product.value = {
    name: '',
    description: '',
    categoryId: null,
    subcategoryId: null,
    vatType: 'exclusive',
    brandId: null,
    lowStockAlert: 0,
    unitId: null,
    selectedTaxes: []
  };
  currentStep.value = 0;
};

const handleSubmit = async () => {
  try {
    const productId = await productStore.createProduct(product.value);
    resetForm();
    emit('submit-success');
  } catch (error) {
    console.error('Error submitting product:', error);
    $toast.error('Failed to create product');
  }
};

const nextStep = () => {
  if (currentStep.value < 2) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--;
};

const open_category = ref(false);
const open_subcategory = ref(false);
const open_brand = ref(false);
const open_unit = ref(false);

const handleAddCategory = () => {
  open_category.value = true;
};
const handleAddBrand = () => {
  open_brand.value = true;
};
const handleAddUnit = () => {
  open_unit.value = true;
};
const handleAddSubCategory = () => {
  open_subcategory.value = true;
};
const handleOk = () => {
  open_category.value = false;
  open_subcategory.value = false;
  open_brand.value = false;
  open_unit.value = false;
};
const handleCancel = () => {
  open_category.value = false;
  open_subcategory.value = false;
  open_brand.value = false;
  open_unit.value = false;
};
const handleSubmitSuccess = () => {
  handleOk();
  $toast.success('Item added successfully');
};

const filterOption = (input, option) => {
  const name = option.children?.toString() || '';
  return name.toLowerCase().includes(input.toLowerCase());
};
</script>

<style scoped>
.product-form-container {
  margin: 0 auto;
  padding: 20px;
}

.steps-nav {
  margin-bottom: 40px;
  margin-top: 30px;
}

.step-content {
  margin-bottom: 30px;
}

.step-title {
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 600;
  color: #333;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-col {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
  color: #555;
}

:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-input-number) {
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

:deep(.ant-btn) {
  height: 40px;
  font-size: 16px;
  border-radius: 4px;
}

.add-new-btn {
  margin-top: 8px;
  color: #1890ff;
}

@media (max-width: 767px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .form-actions .ant-btn {
    width: 100%;
  }
}
</style>