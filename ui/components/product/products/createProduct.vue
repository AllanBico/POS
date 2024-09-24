<template>
  <a-card>
    <a-steps :current="currentStep" class="steps-header">
      <a-step title="Product Details" />
      <a-step title="Variants" />
      <a-step title="Review" />
    </a-steps>
    <div class="steps-content">
      <template v-if="currentStep === 0">
        <!-- Step 1: Product Details -->
        <form @submit.prevent="nextStep" class="form-layout">
          <a-form-item label="Product Name" class="form-item">
            <a-input v-model:value="product.name" placeholder="Enter product name" />
          </a-form-item>
          <a-form-item label="Description" class="form-item">
            <a-textarea v-model:value="product.description" placeholder="Enter product description" />
          </a-form-item>
          <a-form-item label="Is Composition?" class="form-item">
            <a-switch v-model:checked="product.isComposition" />
          </a-form-item>
          <a-form-item label="Category" class="form-item">
            <a-button type="link" @click="handleAddCategory" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.categoryId" placeholder="Select category" show-search :filter-option="filterOption">
              <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Subcategory" class="form-item">
            <a-button type="link" @click="handleAddSubCategory" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.subcategoryId" placeholder="Select subcategory">
              <a-select-option v-for="subcategory in subcategories" :key="subcategory.id" :value="subcategory.id">
                {{ subcategory.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Brand" class="form-item">
            <a-button type="link" @click="handleAddBrand" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.brandId" placeholder="Select brand">
              <a-select-option v-for="brand in brandStore.brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Unit" class="form-item">
            <a-button type="link" @click="handleAddUnit" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.unitId" placeholder="Select unit">
              <a-select-option v-for="unit in unitStore.units" :key="unit.id" :value="unit.id">
                {{ unit.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Low Stock Alert" class="form-item">
            <a-input-number v-model:value="product.lowStockAlert" placeholder="Enter low stock alert quantity" min="0" />
          </a-form-item>
          <a-form-item label="VAT Type" class="form-item">
            <a-select v-model:value="product.vatType" placeholder="Select VAT type">
              <a-select-option value="inclusive">Inclusive</a-select-option>
              <a-select-option value="exclusive">Exclusive</a-select-option>
              <a-select-option value="exempted">Exempted</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Select Taxes" class="form-item">
            <a-select
                v-model:value="product.selectedTaxes"
                mode="multiple"
                placeholder="Select Taxes"
                labelInValue
                :options="taxStore.taxes.map(tax => ({ label: tax.name, value: tax.id }))"
            />
          </a-form-item>
          <div class="form-actions">
            <a-button type="primary" html-type="submit">Next</a-button>
          </div>
        </form>
      </template>

      <template v-else-if="currentStep === 1">
        <!-- Step 2: Variants -->
        <form @submit.prevent="addVariant" class="form-layout">
          <div class="form-actions">
            <a-button type="link" @click="handleAddAttribute" :icon="h(PlusOutlined)">Add New Attribute</a-button>
            <a-button type="link" @click="handleAddAttributeValue" :icon="h(PlusOutlined)">Add New Attribute Value</a-button>
          </div>
          <div v-for="(attributeSelection, index) in newVariant.attributes" :key="index" class="attribute-selection">
            <a-form-item :label="'Select Attribute ' + (index + 1)" class="form-item">
              <a-select v-model:value="attributeSelection.attributeId" @change="fetchValuesForAttribute(attributeSelection.attributeId, index)" placeholder="Select attribute">
                <a-select-option v-for="attribute in attributes" :key="attribute.id" :value="attribute.id">
                  {{ attribute.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item :label="'Select Attribute Value ' + (index + 1)" class="form-item">
              <a-select v-model:value="attributeSelection.valueId" placeholder="Select attribute value">
                <a-select-option v-for="value in attributeSelection.attributeValues" :key="value.id" :value="value.id">
                  {{ value.value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <a-button @click="addNewAttribute" class="add-attribute-btn">Add Another Attribute</a-button>
          <a-form-item label="SKU" class="form-item">
            <a-input v-model:value="newVariant.sku" placeholder="Enter SKU" />
          </a-form-item>
          <a-form-item label="Price" class="form-item">
            <a-input-number v-model:value="newVariant.price" placeholder="Enter price" />
          </a-form-item>
          <a-form-item label="Stock Quantity" class="form-item">
            <a-input-number v-model:value="newVariant.stockQuantity" placeholder="Enter stock quantity" />
          </a-form-item>
          <a-form-item label="Image" class="form-item">
            <a-upload
                name="file"
                :customRequest="handleImageUpload"
                :showUploadList="false"
            >
              <a-button icon="upload">Upload Image</a-button>
            </a-upload>
          </a-form-item>
          <div class="form-actions">
            <a-button type="primary" html-type="submit">Add Variant</a-button>
            <a-button @click="prevStep" style="margin-left: 8px;">Previous</a-button>
          </div>
        </form>

        <!-- Displaying added variants -->
        <div v-for="(variant, index) in variants" :key="index" class="variant-item">
          <div v-for="(attribute, attrIndex) in variant.attributes" :key="attrIndex">
            <p><strong>Attribute:</strong> {{ getAttributeName(attribute.attributeId) }}</p>
            <p><strong>Attribute Value:</strong> {{ getAttributeValueName(attribute.valueId) }}</p>
          </div>
          <p><strong>SKU:</strong> {{ variant.sku }}</p>
          <p><strong>Price:</strong> {{ variant.price }}</p>
          <p><strong>Stock Quantity:</strong> {{ variant.stockQuantity }}</p>
          <p><strong>Image:</strong> {{ variant.image ? 'Uploaded' : 'Not uploaded' }}</p>
          <a-button type="danger" @click="removeVariant(index)">Remove</a-button>
        </div>

        <div class="form-actions">
          <a-button type="primary" @click="nextStep">Next</a-button>
        </div>
      </template>

      <template v-else-if="currentStep === 2">
        <!-- Step 3: Review -->
        <h3>Review Product Details</h3>
        <div class="review-section">
          <p><strong>Product Name:</strong> {{ product.name }}</p>
          <p><strong>Description:</strong> {{ product.description }}</p>
          <p><strong>Category:</strong> {{ getCategoryName(product.categoryId) }}</p>
          <p><strong>Subcategory:</strong> {{ getSubcategoryName(product.subcategoryId) }}</p>
          <p><strong>Brand:</strong> {{  brandStore?.getBrandById(product.brandId) }}</p>
          <p><strong>Unit:</strong> {{  unitStore?.UnitById(product.brandId) }}</p>
          <p><strong>Low Stock Alert:</strong> {{ product.lowStockAlert }}</p>
          <p><strong>VAT Type:</strong> {{ product.vatType }}</p>
          <p><strong>Is Composition?:</strong> {{ product.isComposition }}</p>
          <p><strong>Selected Taxes:</strong> {{ product.selectedTaxes ? product.selectedTaxes.map(tax => tax.label).join(', ') : 'None' }}</p>
        </div>

        <h4>Variants</h4>
        <div v-for="(variant, index) in variants" :key="index" class="variant-item">
          <p><strong>SKU:</strong> {{ variant.sku }}</p>
          <p><strong>Price:</strong> {{ variant.price }}</p>
          <p><strong>Stock Quantity:</strong> {{ variant.stockQuantity }}</p>
          <p><strong>Image:</strong> {{ variant.image ? 'Uploaded' : 'Not uploaded' }}</p>
          <div v-for="(attribute, attrIndex) in variant.attributes" :key="attrIndex">
            <p><strong>Attribute:</strong> {{ getAttributeName(attribute.attributeId) }}</p>
            <p><strong>Attribute Value:</strong> {{ getAttributeValueName(attribute.valueId) }}</p>
          </div>
        </div>

        <div class="form-actions">
          <a-button type="primary" @click="submitProductWithVariants">Submit</a-button>
          <a-button @click="prevStep" style="margin-left: 8px;">Previous</a-button>
        </div>
      </template>
    </div>
  </a-card>

  <!-- Modals -->
  <a-modal v-model:open="open_attribute_value" title="Add Attribute" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
    <attribute-value-add-modal @submit-success="handleSubmitSuccess"></attribute-value-add-modal>
  </a-modal>
  <a-modal v-model:open="open_attribute" title="Add Attribute" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
    <attribute-add-modal @submit-success="handleSubmitSuccess"></attribute-add-modal>
  </a-modal>
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
import { ref } from 'vue';
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
import AttributeAddModal from '~/components/product/attributes/attributeAddModal.vue';
import AttributeValueAddModal from '~/components/product/attributes/attributeValueAddModal.vue';
import { PlusOutlined } from '@ant-design/icons-vue';

const { $toast } = useNuxtApp();
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
const router = useRouter();
const selectedTaxes = ref([]);
const currentStep = ref(0);
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

const newVariant = ref({
  sku: '',
  price: null,
  stockQuantity: null,
  image: null,
  attributes: [
    { attributeId: null, valueId: null, attributeValues: [] },
  ],
});

const variants = ref([]);

const categories = ref([]);
const subcategories = ref([]);
const attributes = ref([]);

const nextStep = () => {
  currentStep.value += 1;
};

const prevStep = () => {
  currentStep.value -= 1;
};

const addVariant = () => {
  variants.value.push({ ...newVariant.value });
  resetVariantForm();
};

const resetVariantForm = () => {
  newVariant.value.sku = '';
  newVariant.value.price = null;
  newVariant.value.stockQuantity = null;
  newVariant.value.image = null;
  newVariant.value.attributes = [
    { attributeId: null, valueId: null, attributeValues: [] },
  ];
};

const addNewAttribute = () => {
  newVariant.value.attributes.push({ attributeId: null, valueId: null, attributeValues: [] });
};

const removeVariant = (index) => {
  variants.value.splice(index, 1);
};

const resetForm = () => {
  product.value = { name: '', description: '', categoryId: null, subcategoryId: null, vatType: 'exclusive', brandId: null, lowStockAlert: 0, unitId: null, selectedTaxes: [] };
  variants.value = [];
  currentStep.value = 0;
};

const submitProductWithVariants = async () => {
  try {
    const productId = await productStore.createProduct(product.value);
    for (const variant of variants.value) {
      variant.productId = productId.id;
      const createdVariant = await productStore.createVariant(variant);
      for (const attribute of variant.attributes) {
        const newVariantAttributeValue = {
          attributeValueId: attribute.valueId,
          variantId: createdVariant.id,
        };
        await productStore.createVariantAttributeValue(newVariantAttributeValue);
      }
      if (variant.image) {
        await productStore.uploadImage(createdVariant.id, variant.image);
      }
    }
    await navigateTo('/products');
    $toast.success('Product and variants created successfully');
    resetForm();
  } catch (error) {
    console.error('Error submitting product and variants:', error);
    $toast.error('Failed to create product and variants');
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

const fetchValuesForAttribute = async (attributeId, index) => {
  newVariant.value.attributes[index].attributeValues = await attributesStore.ValuesByAttributeId(parseInt(attributeId));
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId);
  return category ? category.name : '';
};

const getSubcategoryName = (subcategoryId) => {
  const subcategory = subcategories.value.find(subcat => subcat.id === subcategoryId);
  return subcategory ? subcategory.name : '';
};

const getAttributeName = (attributeId) => {
  const attribute = attributes.value.find(attr => attr.id === attributeId);
  return attribute ? attribute.name : '';
};

const getAttributeValueName = (attributeValueId) => {
  const value = attributes.value.find(val => val.id === attributeValueId);
  return value ? value.value : '';
};

const getBrandName = (id) => brands.value.find(brand => brand.id === id)?.name || 'Unknown';

const open_category = ref(false);
const open_subcategory = ref(false);
const open_brand = ref(false);
const open_unit = ref(false);
const open_attribute = ref(false);
const open_attribute_value = ref(false);
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
  open_attribute.value = false;
  open_attribute_value.value = false;
};
const handleCancel = () => {
  open_category.value = false;
  open_subcategory.value = false;
  open_brand.value = false;
  open_unit.value = false;
  open_attribute.value = false;
  open_attribute_value.value = false;
};
const handleSubmitSuccess = () => {
  open_category.value = false;
  open_subcategory.value = false;
  open_brand.value = false;
  open_unit.value = false;
  open_attribute.value = false;
  open_attribute_value.value = false;
};

const filterOption = (input, option) => {
  const name = option.children?.toString() || '';
  return name.toLowerCase().includes(input.toLowerCase());
};

const handleImageUpload = async ({ file }) => {
  newVariant.value.image = file;
};
</script>

<style scoped>
.steps-header {
  margin-bottom: 20px;
}

.steps-content {
  margin-top: 20px;
}

.form-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.variant-item {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.attribute-selection {
  margin-bottom: 15px;
}

.add-attribute-btn {
  margin-bottom: 16px;
}

.review-section {
  margin-bottom: 20px;
}
</style>