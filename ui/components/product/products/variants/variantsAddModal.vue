<template>
  <a-form :model="newVariant" @submit.prevent="handleSubmit">
    <div class="form-actions">
      <a-button type="link" @click="handleAddAttribute" :icon="h(PlusOutlined)">Add New Attribute</a-button>
      <a-button type="link" @click="handleAddAttributeValue" :icon="h(PlusOutlined)">Add New Attribute Value</a-button>
    </div>

    <a-table :dataSource="variants" :columns="columns" :pagination="false">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'attributes'">
          <div v-for="(attributeSelection, attrIndex) in record.attributes" :key="attrIndex">
            <a-select
              v-model:value="attributeSelection.attributeId"
              @change="(value) => fetchValuesForAttribute(value, index, attrIndex)"
              placeholder="Select attribute"
              style="width: 45%; margin-right: 5%;"
            >
              <a-select-option v-for="attribute in attributesStore.attributes" :key="attribute.id" :value="attribute.id">
                {{ attribute.name }}
              </a-select-option>
            </a-select>
            <a-select
              v-model:value="attributeSelection.valueId"
              placeholder="Select attribute value"
              style="width: 45%;"
            >
              <a-select-option v-for="value in attributeSelection.attributeValues" :key="value.id" :value="value.id">
                {{ value.value }}
              </a-select-option>
            </a-select>
          </div>
          <a-button @click="addNewAttribute(index)" type="dashed" block class="add-attribute-btn">
            <plus-outlined />
            Add Another Attribute
          </a-button>
        </template>
        <template v-else-if="column.dataIndex === 'sku'">
          <a-input v-model:value="record.sku" placeholder="Enter SKU" required />
        </template>
        <template v-else-if="column.dataIndex === 'price'">
          <a-input-number v-model:value="record.price" placeholder="Enter price" :min="0" :step="0.01" required />
        </template>
        <template v-else-if="column.dataIndex === 'stockQuantity'">
          <a-input-number v-model:value="record.stockQuantity" placeholder="Enter stock quantity" :min="0" :step="1" />
        </template>
        <template v-else-if="column.dataIndex === 'code'">
          <a-input v-model:value="record.code" placeholder="Enter code" />
        </template>
        <template v-else-if="column.dataIndex === 'partNumber'">
          <a-input v-model:value="record.partNumber" placeholder="Enter part number" />
        </template>
        <template v-else-if="column.dataIndex === 'image'">
          <a-upload
            name="file"
            :customRequest="(info) => handleImageUpload(info, index)"
            :showUploadList="true"
          >
            <a-button icon="upload">Upload Image</a-button>
          </a-upload>
        </template>
        <template v-else-if="column.dataIndex === 'destinationType'">
          <a-select v-model:value="record.destinationType" placeholder="Select Destination Type" required>
            <a-select-option value="warehouse">Warehouse</a-select-option>
            <a-select-option value="store">Store</a-select-option>
          </a-select>
        </template>
        <template v-else-if="column.dataIndex === 'destinationId'">
          <a-select
            v-model:value="record.destinationId"
            placeholder="Select Destination"
            v-if="record.destinationType"
            required
          >
            <a-select-option
              v-for="option in getDestinationOptions(record.destinationType)"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </a-select-option>
          </a-select>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <a-button @click="removeVariant(index)" type="text" danger>
            <delete-outlined />
          </a-button>
        </template>
      </template>
    </a-table>

    <div class="form-actions">
      <a-button type="dashed" @click="addVariant" block icon="plus">Add Variant</a-button>
    </div>

    <div class="form-actions">
      <a-button type="primary" html-type="submit" :loading="loading">Submit</a-button>
    </div>
  </a-form>

  <!-- Modals -->
  <a-modal v-model:visible="modalVisible.attribute" title="Add Attribute" @ok="handleModalOk" @cancel="handleModalCancel">
    <attribute-add-modal @submit-success="handleAttributeAddSuccess"></attribute-add-modal>
  </a-modal>
  <a-modal v-model:visible="modalVisible.attributeValue" title="Add Attribute Value" @ok="handleModalOk" @cancel="handleModalCancel">
    <attribute-value-add-modal @submit-success="handleAttributeValueAddSuccess" :attribute_id="attributeSelection.attributeId"></attribute-value-add-modal>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useProductStore } from '@/stores/product/ProductStore.js';
import { useAttributesStore } from '@/stores/product/AttributeStore.js';
import { useStoreStore } from '~/stores/storesStore.js';
import { useWarehouseStore } from '~/stores/WarehouseStore.js';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import AttributeAddModal from '~/components/product/attributes/attributeAddModal.vue';
import AttributeValueAddModal from '~/components/product/attributes/attributeValueAddModal.vue';
const { $toast } = useNuxtApp();
const props = defineProps({
  productId: {
    type: Number,
    required: true,
  }
});

const emit = defineEmits(['submit-success', 'update:isVisible']);

const productStore = useProductStore();
const attributesStore = useAttributesStore();
const storeStore = useStoreStore();
const warehouseStore = useWarehouseStore();

attributesStore.fetchAttributes();
attributesStore.fetchAttributeValues();
storeStore.fetchStores();
warehouseStore.fetchWarehouses();

const loading = ref(false);
const variants = ref([createEmptyVariant()]);
const attributes = ref([]);
const modalVisible = reactive({
  attribute: false,
  attributeValue: false
});

const columns = [
  {
    title: 'Attributes',
    dataIndex: 'attributes',
    key: 'attributes',
  },
  {
    title: 'SKU',
    dataIndex: 'sku',
    key: 'sku',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Stock Quantity',
    dataIndex: 'stockQuantity',
    key: 'stockQuantity',
  },
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Part Number',
    dataIndex: 'partNumber',
    key: 'partNumber',
  },
  {
    title: 'Image',
    dataIndex: 'image',
    key: 'image',
  },
  {
    title: 'Destination Type',
    dataIndex: 'destinationType',
    key: 'destinationType',
  },
  {
    title: 'Destination',
    dataIndex: 'destinationId',
    key: 'destinationId',
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
  },
];

function createEmptyVariant() {
  return {
    sku: '',
    price: null,
    stockQuantity: null,
    code: '',
    partNumber: '',
    image: null,
    destinationType: null,
    destinationId: null,
    attributes: [{ attributeId: null, valueId: null, attributeValues: [] }]
  };
}

function addVariant() {
  variants.value.push(createEmptyVariant());
}

function removeVariant(index) {
  variants.value.splice(index, 1);
}

function addNewAttribute(variantIndex) {
  variants.value[variantIndex].attributes.push({ attributeId: null, valueId: null, attributeValues: [] });
}

async function fetchValuesForAttribute(attributeId, variantIndex, attributeIndex) {
  const values = await attributesStore.ValuesByAttributeId(parseInt(attributeId));
  variants.value[variantIndex].attributes[attributeIndex].attributeValues = values;
}

function handleAddAttribute() {
  modalVisible.attribute = true;
}

function handleAddAttributeValue() {
  modalVisible.attributeValue = true;
}

function handleModalOk() {
  modalVisible.attribute = false;
  modalVisible.attributeValue = false;
}

function handleModalCancel() {
  modalVisible.attribute = false;
  modalVisible.attributeValue = false;
}

function handleAttributeAddSuccess() {
  handleModalOk();
  fetchAttributes();
}

function handleAttributeValueAddSuccess() {
  handleModalOk();
}

async function handleImageUpload({ file }, variantIndex) {
  variants.value[variantIndex].image = file;
}

function getDestinationOptions(destinationType) {
  return destinationType === 'warehouse'
    ? warehouseStore.warehouses
    : storeStore.stores;
}

async function handleSubmit() {
  try {
    loading.value = true;

    for (const variant of variants.value) {
      if (!variant.destinationType || !variant.destinationId || !variant.sku || !variant.price) {
        throw new Error('Please fill in all required fields (Destination Type, Destination, SKU, and Price) for all variants.');
      }

      variant.productId = props.productId;
      console.log("variant", variant);
      const createdVariant = await productStore.createVariant(variant);
      for (const attribute of variant.attributes) {
        const newVariantAttributeValue = {
          attributeValueId: attribute.valueId,
          variantId: createdVariant.id,
        };
        console.log("newVariantAttributeValue", newVariantAttributeValue);
        await productStore.createVariantAttributeValue(newVariantAttributeValue);
      }
      if (variant.image) {
        console.log("createdVariant.id, variant.image", createdVariant.id, variant.image);
        await productStore.uploadImage(createdVariant.id, variant.image);
      }
    }

    emit('submit-success');
  } catch (error) {
    console.error('Error creating variants:', error);
    // Show error message to user
    // You can use your preferred method to show errors, e.g., Ant Design message component
    $toast.error(error.message);
    // message.error(error.message);
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  emit('update:isVisible', false);
}

async function fetchAttributes() {
  attributes.value = attributesStore.attributes;
}

fetchAttributes();
</script>

<style scoped>
.add-attribute-btn {
  margin-top: 8px;
}

.form-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.preview-image {
  max-width: 100px;
  max-height: 100px;
  margin-top: 8px;
}
</style>
