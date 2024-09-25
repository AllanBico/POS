<template>

    <a-form @submit="handleSubmit" layout="vertical">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="Product Name" class="form-item">
            <a-input v-model:value="product.name" placeholder="Enter product name"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Description" class="form-item">
            <a-textarea v-model:value="product.description" placeholder="Enter product description"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="Is Composition?" class="form-item">
            <a-switch v-model:checked="product.isComposition"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Low Stock Alert" class="form-item">
            <a-input-number v-model:value="product.lowStockAlert" placeholder="Enter low stock alert quantity" min="0"/>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="Category" class="form-item">
            <a-button type="link" @click="handleAddCategory" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.categoryId" placeholder="Select category" show-search :filter-option="filterOption">
              <a-select-option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Subcategory" class="form-item">
            <a-button type="link" @click="handleAddSubCategory" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.subcategoryId" placeholder="Select subcategory">
              <a-select-option v-for="subcategory in subcategoryStore.subcategories" :key="subcategory.id" :value="subcategory.id">
                {{ subcategory.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="Brand" class="form-item">
            <a-button type="link" @click="handleAddBrand" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.brandId" placeholder="Select brand">
              <a-select-option v-for="brand in brandStore.brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Unit" class="form-item">
            <a-button type="link" @click="handleAddUnit" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.unitId" placeholder="Select unit">
              <a-select-option v-for="unit in unitStore.units" :key="unit.id" :value="unit.id">
                {{ unit.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item label="VAT Type" class="form-item">
            <a-select v-model:value="product.vatType" placeholder="Select VAT type">
              <a-select-option value="inclusive">Inclusive</a-select-option>
              <a-select-option value="exclusive">Exclusive</a-select-option>
              <a-select-option value="exempted">Exempted</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="Select Taxes" class="form-item">
            <a-select
                v-model:value="product.selectedTaxes"
                mode="multiple"
                placeholder="Select Taxes"
                labelInValue
                :options="taxStore.taxes.map(tax => ({ label: tax.name, value: tax.id }))"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item class="submit-button">
        <a-button type="primary" @click="handleSubmit" :loading="productStore.loading">
          Submit
        </a-button>
      </a-form-item>
    </a-form>

  <a-modal v-model:open="open_unit" title="Add Unit" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
    <UnitsAddModal @submit-success="handleSubmitSuccess"></UnitsAddModal>
  </a-modal>
  <a-modal v-model:open="open_subcategory" title="Add SubCategory" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
    <sub-category-add-modal @submit-success="handleSubmitSuccess"></sub-category-add-modal>
  </a-modal>
  <a-modal v-model:open="open_category" title="Add Category" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
    <category-add-modal @submit-success="handleSubmitSuccess"></category-add-modal>
  </a-modal>
  <a-modal v-model:open="open_brand" title="Add Brand" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
    <brand-add-modal @submit-success="handleSubmitSuccess"></brand-add-modal>
  </a-modal>
</template>
<script setup>
import {ref} from 'vue';
import {useProductStore} from '~/stores/product/ProductStore.js';
import {useCategoryStore} from '~/stores/product/CategoryStore.js';
import {useSubcategoryStore} from '~/stores/product/SubcategoryStore.js';
import {useAttributesStore} from '~/stores/product/AttributeStore.js';
import {useBrandStore} from '~/stores/product/BrandStore.js';
import {useUnitStore} from '~/stores/product/UnitStore.js';
import {useTaxStore} from '@/stores/taxStore.js';
import CategoryAddModal from '~/components/product/categories/categoryAddModal.vue';
import SubCategoryAddModal from '~/components/product/subcategories/subCategoryAddModal.vue';
import BrandAddModal from '~/components/product/brands/brandAddModal.vue';
import UnitsAddModal from '~/components/product/units/unitsAddModal.vue';
import {PlusOutlined} from '@ant-design/icons-vue';

const emit = defineEmits(['submit-success']);
const {$toast} = useNuxtApp();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const subcategoryStore = useSubcategoryStore();
const attributesStore = useAttributesStore();
const brandStore = useBrandStore();
const unitStore = useUnitStore();
const taxStore = useTaxStore();
attributesStore.fetchAttributeValues();
brandStore.fetchBrands();
unitStore.fetchUnits();
taxStore.fetchTaxes();

const categories = ref([]);
const subcategories = ref([]);
const attributes = ref([]);

const props = defineProps({
  productId: {
    type: Number,
    required: true,
  },
});

const loading = ref(false);
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
const fetchProduct = async () => {
  try {
    loading.value = true;
    product.value = await productStore.productById(parseInt(props.productId));
    product.value.selectedTaxes = await taxStore.fetchTaxByProduct(parseInt(props.productId))
  } catch (error) {
    console.error('Error fetching product:', error);
  } finally {
    loading.value = false;
  }
};
fetchProduct()
const handleSubmit = async () => {
  try {
    await productStore.updateProduct(props.productId, product.value); // Update the product
    emit('submit-success');
  } catch (error) {
    console.error('Error updating product:', error);
  } finally {
    loading.value = false;
  }
};

categoryStore.fetchCategories().then(() => {
  categories.value = categoryStore.categories;
});
subcategoryStore.fetchSubcategories().then(() => {
  subcategories.value = subcategoryStore.subcategories;
});

attributesStore.fetchAttributes().then(() => {
  attributes.value = attributesStore.attributes;
});

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
const handleAddAttribute = () => {
  open_attribute.value = true;
};
const handleAddAttributeValue = () => {
  open_attribute_value.value = true;
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
  open_category.value = false;
  open_subcategory.value = false;
  open_brand.value = false;
  open_unit.value = false;
};

const filterOption = (input, option) => {
  const name = option.children?.toString() || '';
  return name.toLowerCase().includes(input.toLowerCase());
};

const visible = ref(true); // This should be controlled by the parent component
</script>
<style scoped>
.form-item {
  margin-bottom: 24px;
}
</style>