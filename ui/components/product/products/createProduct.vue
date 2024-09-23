<template>
  <a-modal v-model:open="open_attribute_value" title="Add Attribute" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
           cancel-text="Cancel">
    <attribute-value-add-modal  @submit-success="handleSubmitSuccess"></attribute-value-add-modal>
    <template #footer>
    </template>
  </a-modal>
  <a-modal v-model:open="open_attribute" title="Add Attribute" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
           cancel-text="Cancel">
    <attribute-add-modal @submit-success="handleSubmitSuccess"></attribute-add-modal>
    <template #footer>
    </template>
  </a-modal>
  <a-modal v-model:open="open_unit" title="Add Unit" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"  cancel-text="Cancel">
    <UnitsAddModal @submit-success="handleSubmitSuccess"></UnitsAddModal>
    <template #footer>
    </template>
  </a-modal>
  <a-modal v-model:open="open_subcategory" title="Add SubCategory" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
           cancel-text="Cancel">
    <sub-category-add-modal @submit-success="handleSubmitSuccess"></sub-category-add-modal>
    <template #footer>
    </template>
  </a-modal>
  <a-modal v-model:open="open_category" title="Add Category" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
           cancel-text="Cancel">
    <category-add-modal @submit-success="handleSubmitSuccess"></category-add-modal>
    <template #footer>
    </template>
  </a-modal>
  <a-modal v-model:open="open_brand" title="Add Brand" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
           cancel-text="Cancel">
    <brand-add-modal @submit-success="handleSubmitSuccess"></brand-add-modal>
    <template #footer>
    </template>
  </a-modal>
  <a-card>
    <a-steps :current="currentStep">
      <a-step title="Product Details" />
      <a-step title="Variants" />
      <a-step title="Review" />
    </a-steps>
    <div class="steps-content">
      <template v-if="currentStep === 0">
        <!-- Step 1: Product Details -->
        <form @submit.prevent="nextStep" >
          <a-form-item label="Product Name">
            <a-input v-model:value="product.name" placeholder="Enter product name" />
          </a-form-item>
          <a-form-item label="Description">
            <a-textarea v-model:value="product.description" placeholder="Enter product description" />
          </a-form-item>
          <a-form-item label="Is Composition?">
            <a-switch v-model:checked="product.isComposition" />
          </a-form-item>
          <a-form-item label="Category">
            <a-button type="link" @click="handleAddCategory" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.categoryId" placeholder="Select category" show-search :filter-option="filterOption">
              <a-select-option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Subcategory">
            <a-button type="link" @click="handleAddSubCategory" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.subcategoryId" placeholder="Select subcategory">
              <a-select-option v-for="subcategory in subcategories" :key="subcategory.id" :value="subcategory.id">
                {{ subcategory.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Brand">
            <a-button type="link" @click="handleAddBrand" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.brandId" placeholder="Select brand">
              <a-select-option v-for="brand in brandStore.brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Unit">
            <a-button type="link" @click="handleAddUnit" :icon="h(PlusOutlined)">Add New</a-button>
            <a-select v-model:value="product.unitId" placeholder="Select unit">
              <a-select-option v-for="unit in unitStore.units" :key="unit.id" :value="unit.id">
                {{ unit.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Low Stock Alert">
            <a-input-number v-model:value="product.lowStockAlert" placeholder="Enter low stock alert quantity" min="0" />
          </a-form-item>
          <a-form-item label="VAT Type">
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
          <a-button type="primary" html-type="submit">Next</a-button>
        </form>
      </template>

      <template v-else-if="currentStep === 1">
        <!-- Step 2: Variants -->
        <form @submit.prevent="addVariant">
          <a-button type="link" @click="handleAddAttribute" :icon="h(PlusOutlined)">Add New</a-button>
          <a-button type="link" @click="handleAddAttributeValue" :icon="h(PlusOutlined)">Add New</a-button>
          <div v-for="(attributeSelection, index) in newVariant.attributes" :key="index" class="attribute-selection">

            <a-form-item :label="'Select Attribute ' + (index + 1)">
              <a-select v-model:value="attributeSelection.attributeId" @change="fetchValuesForAttribute(attributeSelection.attributeId, index)" placeholder="Select attribute">
                <a-select-option v-for="attribute in attributes" :key="attribute.id" :value="attribute.id">
                  {{ attribute.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item :label="'Select Attribute Value ' + (index + 1)">
              <a-select v-model:value="attributeSelection.valueId" placeholder="Select attribute value">
                <a-select-option v-for="value in attributeSelection.attributeValues" :key="value.id" :value="value.id">
                  {{ value.value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <a-button @click="addNewAttribute">Add Another Attribute</a-button>
          <a-form-item label="SKU">
            <a-input v-model:value="newVariant.sku" placeholder="Enter SKU" />
          </a-form-item>
          <a-form-item label="Price">
            <a-input-number v-model:value="newVariant.price" placeholder="Enter price" />
          </a-form-item>
          <a-form-item label="Stock Quantity">
            <a-input-number v-model:value="newVariant.stockQuantity" placeholder="Enter stock quantity" />
          </a-form-item>
          <a-form-item label="Image">
            <a-upload
                name="file"
                :customRequest="handleImageUpload"
                :showUploadList="false"
            >
              <a-button icon="upload">Upload Image</a-button>
            </a-upload>
          </a-form-item>
          <a-button type="primary" html-type="submit">Add Variant</a-button>
          <a-button @click="prevStep" style="margin-left: 8px;">Previous</a-button>
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

        <a-button type="primary" @click="nextStep">Next</a-button>
      </template>

      <template v-else-if="currentStep === 2">
        <!-- Step 3: Review -->
        <h3>Review Product Details</h3>
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

        <a-button type="primary" @click="submitProductWithVariants">Submit</a-button>
        <a-button @click="prevStep" style="margin-left: 8px;">Previous</a-button>
      </template>
    </div>
  </a-card>
</template>

<script setup>
import { ref } from 'vue';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useCategoryStore } from '~/stores/product/CategoryStore.js';
import { useSubcategoryStore } from '~/stores/product/SubcategoryStore.js';
import { useAttributesStore } from '~/stores/product/AttributeStore.js';
import { useBrandStore } from '~/stores/product/BrandStore.js';
import {useUnitStore} from "~/stores/product/UnitStore.js";
import CategoryAddModal from "~/components/product/categories/categoryAddModal.vue";
import {PlusOutlined} from "@ant-design/icons-vue";
import SubCategoryAddModal from "~/components/product/subcategories/subCategoryAddModal.vue";
import BrandAddModal from "~/components/product/brands/brandAddModal.vue";
import UnitsAddModal from "~/components/product/units/unitsAddModal.vue";
import AttributeAddModal from "~/components/product/attributes/attributeAddModal.vue";
import AttributeValueAddModal from "~/components/product/attributes/attributeValueAddModal.vue";
import { useTaxStore } from '@/stores/taxStore.js'; // Store to fetch available taxes

const { $toast } = useNuxtApp();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const subcategoryStore = useSubcategoryStore();
const attributesStore = useAttributesStore();
const brandStore = useBrandStore(); // Initialize the brand store
const unitStore = useUnitStore();
const taxStore = useTaxStore(); // Tax store instance
attributesStore.fetchAttributeValues();
brandStore.fetchBrands()
unitStore.fetchUnits()
taxStore.fetchTaxes()
const router = useRouter();
const selectedTaxes = ref([]);
const currentStep = ref(0);
const product = ref({
  name: '',
  description: '',
  categoryId: null,
  subcategoryId: null,
  vatType: 'exclusive',
  brandId: null, // Add brandId to the product object
  unitId: null,
  lowStockAlert: 0, // Add lowStockAlert to the product object
  isComposition:false,
  selectedTaxes: [], // Initialize selectedTaxes as an empty array

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
  product.value = { name: '', description: '', categoryId: null, subcategoryId: null, vatType: 'exclusive',brandId: null,lowStockAlert: 0,unitId: null,selectedTaxes: [] };
  variants.value = [];
  currentStep.value = 0;
};

const submitProductWithVariants = async () => {
  try {
    console.log("selected Taxes",product.selectedTaxes)
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
      console.log("variant.image",variant.image)
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

// Fetch categories and subcategories
categoryStore.fetchCategories().then(() => {
  categories.value = categoryStore.categories;
});
subcategoryStore.fetchSubcategories().then(() => {
  subcategories.value = subcategoryStore.subcategories;
});

// Fetch attributes on component mount
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
const getBrandName = (id) => brands.value.find(brand => brand.id === id)?.name || 'Unknown'; // Function to get brand name

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
  const name = option.children?.toString() || ''; // Use option.children which represents the inner text of the option
  return name.toLowerCase().includes(input.toLowerCase());
};

const handleImageUpload = async ({ file }) => {
  newVariant.value.image = file;
};
</script>

<style scoped>
.steps-content {
  margin-top: 20px;
}

.variant-item {
  margin-top: 15px;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.attribute-selection {
  margin-bottom: 15px;
}
</style>