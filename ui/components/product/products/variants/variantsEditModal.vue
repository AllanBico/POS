<template>
  <a-form :model="variantData" @submit.prevent="handleSubmit">
    <a-form-item label="SKU" required>
      <a-input v-model:value="variantData.sku" placeholder="Enter SKU" />
    </a-form-item>

    <a-form-item label="Price" required>
      <a-input-number v-model:value="variantData.price" placeholder="Enter price" :min="0" :step="0.01" />
    </a-form-item>

    <a-form-item label="Stock Quantity">
      <a-input-number v-model:value="variantData.stockQuantity" placeholder="Enter stock quantity" :min="0" :step="1" />
    </a-form-item>

    <a-form-item label="Code">
      <a-input v-model:value="variantData.code" placeholder="Enter code" />
    </a-form-item>

    <a-form-item label="Part Number">
      <a-input v-model:value="variantData.partNumber" placeholder="Enter part number" />
    </a-form-item>

    <a-form-item label="Image">
      <a-upload
          name="file"
          :customRequest="handleImageUpload"
          :showUploadList="true"
      >
        <a-button icon="upload">Upload Image</a-button>
      </a-upload>
      <img v-if="variantData.imageUrl" :src="variantData.imageUrl" class="preview-image" alt="Image Preview" />
    </a-form-item>

    <a-form-item label="Attributes">
      <div v-for="(attribute, index) in sortedAttributes" :key="index" class="attribute-row">
        <a-select
            v-model:value="attribute.attributeId"
            @change="(value) => fetchValuesForAttribute(value, index)"
            placeholder="Select Attribute"
            style="width: 40%; margin-right: 5%;"
        >
          <a-select-option
              v-for="attr in attributesStore.attributes"
              :key="attr.id"
              :value="attr.id"
          >
            {{ attr.name }}
          </a-select-option>
        </a-select>
        <a-select
            v-model:value="attribute.valueId"
            placeholder="Select Value"
            style="width: 40%; margin-right: 5%;"
        >
          <a-select-option
              v-for="value in attribute.attributeValues"
              :key="value.id"
              :value="value.id"
          >
            {{ value.value }}
          </a-select-option>
        </a-select>
        <a-button @click="removeAttribute(index)" type="danger" icon="delete" style="width: 10%;" />
      </div>
      <a-button @click="addAttribute" type="dashed" block class="add-attribute-btn">
        <plus-outlined />
        Add Attribute
      </a-button>
    </a-form-item>

    <a-form-item label="Inventory">
      <div v-for="(inventory, index) in variantData.InventoryVariants" :key="index">
        <a-select
            v-model:value="inventory.destinationType"
            placeholder="Select Destination Type"
            style="width: 30%; margin-right: 5%;"
        >
          <a-select-option value="warehouse">Warehouse</a-select-option>
          <a-select-option value="store">Store</a-select-option>
        </a-select>
        <a-select
            v-model:value="inventory.destinationId"
            placeholder="Select Destination"
            style="width: 30%; margin-right: 5%;"
        >
          <a-select-option
              v-for="option in getDestinationOptions(inventory.destinationType)"
              :key="option.id"
              :value="option.id"
          >
            {{ option.name }}
          </a-select-option>
        </a-select>
        <a-input-number
            v-model:value="inventory.quantity"
            placeholder="Quantity"
            :min="0"
            :step="1"
            style="width: 30%;"
        />
      </div>
    </a-form-item>

    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="loading">Save Changes</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useProductStore } from '@/stores/product/ProductStore.js';
import { useAttributesStore } from '@/stores/product/AttributeStore.js';
import { useStoreStore } from '~/stores/storesStore.js';
import { useWarehouseStore } from '~/stores/WarehouseStore.js';
import { PlusOutlined } from '@ant-design/icons-vue';
const { $toast } = useNuxtApp();
const emit = defineEmits(['submit-success']);
const props = defineProps({
  variantId: {
    type: Number,
    required: true
  }
});

const productStore = useProductStore();
const attributesStore = useAttributesStore();
const storeStore = useStoreStore();
const warehouseStore = useWarehouseStore();

attributesStore.fetchAttributes();
storeStore.fetchStores();
warehouseStore.fetchWarehouses();

const loading = ref(false);
const variantData = reactive({
  sku: '',
  price: null,
  stockQuantity: null,
  code: '',
  partNumber: '',
  imageUrl: '',
  attributes: [],
  InventoryVariants: []
});

const sortedAttributes = computed(() => {
  return [...variantData.attributes].sort((a, b) => {
    const attrA = attributesStore.attributes.find(attr => attr.id === a.attributeId);
    const attrB = attributesStore.attributes.find(attr => attr.id === b.attributeId);
    return (attrA && attrB) ? attrA.name.localeCompare(attrB.name) : 0;
  });
});

onMounted(async () => {
  await fetchVariantData(props.variantId);
});

async function fetchVariantData(variantId) {
  const variant = productStore.variantById(parseInt(variantId));
  console.log("variant", variant);
  Object.assign(variantData, variant);
  variantData.attributes = await Promise.all(variant.variantAttributeValues.map(async vav => {
    const attributeValues = await attributesStore.ValuesByAttributeId(vav.attributeValue.attribute.id);
    return {
      attributeId: vav.attributeValue.attribute.id,
      valueId: vav.attributeValue.id,
      attributeValues: attributeValues
    };
  }));
  variantData.InventoryVariants = variant.InventoryVariants.map(iv => ({
    destinationType: iv.warehouseId ? 'warehouse' : 'store',
    destinationId: iv.warehouseId || iv.storeId,
    quantity: iv.quantity
  }));
}

function getDestinationOptions(destinationType) {
  return destinationType === 'warehouse'
      ? warehouseStore.warehouses
      : storeStore.stores;
}

async function fetchValuesForAttribute(attributeId, index) {
  const values = await attributesStore.ValuesByAttributeId(attributeId);
  variantData.attributes[index].attributeValues = values;
}

async function handleImageUpload({ file }) {
  variantData.image = file;
}

async function addAttribute() {
  variantData.attributes.push({
    attributeId: null,
    valueId: null,
    attributeValues: []
  });
}

function removeAttribute(index) {
  variantData.attributes.splice(index, 1);
}

async function handleSubmit() {
  try {
    loading.value = true;
    await productStore.updateVariant(props.variantId, variantData);
    emit('submit-success');
  } catch (error) {
    $toast.error('Error updating variant: ' + error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.preview-image {
  max-width: 100px;
  max-height: 100px;
  margin-top: 8px;
}
.attribute-row {
  margin-bottom: 8px;
}
.add-attribute-btn {
  margin-top: 8px;
}
</style>
