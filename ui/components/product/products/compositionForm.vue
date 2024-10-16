<template>
  <div class="composition-form-container">
    <h3 style="margin-top: 0">Create Compositions</h3>
    <a-divider style="margin-bottom: 11px; margin-top: 11px" />
    <a-form layout="vertical" @submit.prevent="submitForm">
      <!-- Dynamic Ingredient Rows -->
      <div v-for="(ingredient, index) in ingredientRows" :key="index" class="ingredient-row">
        <a-row :gutter="16">
          <a-col :span="10">
            <a-form-item label="Ingredient">
              <a-select
                v-model:value="ingredient.ingredientVariantId"
                placeholder="Select Compsitions"
                style="width: 100%"
                show-search
                :filter-option="filterOption"
                :options="variantOptions"
              >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Quantity">
              <a-input-number
                v-model:value="ingredient.quantity"
                placeholder="Quantity"
                style="width: 100%"
                :min="1"
                :prefix="variant?.Product?.Unit?.abbreviation"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6" class="remove-btn-col">
            <a-button
              @click="removeRow(index)"
              type="danger"
              shape="circle"
              :icon="h(DeleteOutlined)"
              class="remove-btn"
            />
          </a-col>
        </a-row>
      </div>

      <!-- Button to add new ingredient row -->
      <a-form-item>
        <a-button @click="addRow" type="dashed" block :icon="h(PlusOutlined)">
          Add Ingredient
        </a-button>
      </a-form-item>

      <!-- Submit button -->
      <a-form-item>
        <a-button type="primary" html-type="submit" block>
          <template #icon><PlusOutlined /></template>
          Create Composition
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useProductStore } from '~/stores/product/ProductStore.js';
import {
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";

const emit = defineEmits(['submit-success']);
const productStore = useProductStore();
productStore.fetchVariants()
const variants = productStore.variants;

const props = defineProps({
  variant_id: {
    type: Number,
    required: true,
  },
});
const variant = computed(() => {
  return productStore.variantById(parseInt(props.variant_id))
})
const variantId = ref(props.variant_id);
console.log("props.variant_id", props.variant_id)

const ingredientRows = reactive([
  { ingredientVariantId: null, quantity: 1 }
]);

const addRow = () => {
  ingredientRows.push({ ingredientVariantId: null, quantity: 1 });
};

const removeRow = (index) => {
  ingredientRows.splice(index, 1);
};

const submitForm = async () => {
  if (!variantId.value) {
    console.error('Please select a variant');
    return;
  }

  try {
    console.log("variantId.value, ingredientRows", props.variant_id, ingredientRows)
    await productStore.createComposition(props.variant_id, ingredientRows);
    emit('submit-success');
  } catch (error) {
    console.error('Error adding composition', error);
  }
};

// Create `variantOptions` to transform variants into the {value, label} format
const variantOptions = computed(() =>
productStore.variants.map(variant => ({
      value: variant.id,
      label: `${variant.Product.name} (${variant.sku})`
    }))
);

// Define a filter option function for search
const filterOption = (input, option) => {
  if (productStore.variants) { // Check if variants is defined
    return option.label.toLowerCase().includes(input.toLowerCase());
  }
  return false; // Return false if variants is undefined
};
</script>

<style scoped>
.composition-form-container {
  padding: 1px;
}

.ingredient-row {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.ingredient-row:hover {
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}


.remove-btn-col {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.remove-btn {
  margin-bottom: 24px;
}

:deep(.ant-form-item-label) {
  font-weight: 600;
}

:deep(.ant-select-selector),
:deep(.ant-input-number),
:deep(.ant-btn) {
  border-radius: 4px;
}

:deep(.ant-btn-primary) {
  height: 40px;
  font-size: 16px;
}

:deep(.ant-btn-dashed) {
  height: 40px;
  font-size: 14px;
}
</style>
