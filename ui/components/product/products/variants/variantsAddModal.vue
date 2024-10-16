<template>
  <h3 style="margin-top: 0">Create Attribute</h3>
  <a-divider style="margin-bottom: 11px; margin-top: 11px" />
  <a-form :model="newVariant" @submit.prevent="handleSubmit" layout="vertical">
    <a-form-item >
      <a-table bordered :dataSource="variants" :columns="columns" :pagination="false">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'attributes'">
            <div v-for="(attributeSelection, attrIndex) in record.attributes" :key="attrIndex">
              <a-row :gutter="[8, 8]">
                <a-col :span="12">
                  <a-form-item label="Attribute">
                    <a-select
                      v-model:value="attributeSelection.attributeId"
                      @change="(value) => fetchValuesForAttribute(value, index, attrIndex)"
                      placeholder="Select attribute"
                      style="width: 100%"
                    >
                      <a-select-option v-for="attribute in attributesStore.attributes" :key="attribute.id" :value="attribute.id">
                        {{ attribute.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="Attribute Value">
                    <a-select
                      v-model:value="attributeSelection.valueId"
                      placeholder="Select attribute value"
                      style="width: 100%"
                    >
                      <a-select-option v-for="value in attributeSelection.attributeValues" :key="value.id" :value="value.id">
                        {{ value.value }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
            <a-button @click="addNewAttribute(index)" type="dashed" block class="add-attribute-btn">
              <plus-outlined />
              Add Another Attribute
            </a-button>
          </template>
          <template v-else-if="column.dataIndex === 'sku'">
            <a-form-item label="SKU">
              <a-input v-model:value="record.sku" placeholder="Enter SKU" required />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'price'">
            <a-form-item label="Price">
              <a-input-number v-model:value="record.price" placeholder="Enter price" :min="0" :step="0.01" required />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'stockQuantity'">
            <a-form-item label="Stock Quantity">
              <a-input-number v-model:value="record.stockQuantity" placeholder="Enter stock quantity" :min="0" :step="1" />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'code'">
            <a-form-item label="Code">
              <a-input v-model:value="record.code" placeholder="Enter code" />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'partNumber'">
            <a-form-item label="Part Number">
              <a-input v-model:value="record.partNumber" placeholder="Enter part number" />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'image'">
            <a-form-item label="Image">
              <a-upload
                name="file"
                :customRequest="(info) => handleImageUpload(info, index)"
                :showUploadList="true"
              >
                <a-button icon="upload">Upload Image</a-button>
              </a-upload>
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'destinationType'">
            <a-form-item label="Destination Type">
              <a-select v-model:value="record.destinationType" placeholder="Select Destination Type" required>
                <a-select-option value="warehouse">Warehouse</a-select-option>
                <a-select-option value="store">Store</a-select-option>
              </a-select>
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'destinationId'">
            <a-form-item label="Destination">
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
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button @click="removeVariant(index)" type="text" danger>
              <delete-outlined />
            </a-button>
          </template>
        </template>
      </a-table>
    </a-form-item>
    <a-form-item>
      <a-button type="dashed" @click="addVariant" block icon="plus">Add Variant</a-button>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="loading">Submit</a-button>
    </a-form-item>
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
