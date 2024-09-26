<template>
  <a-form @submit.prevent="submitForm">

    <!-- Dynamic Ingredient Rows -->
    <div v-for="(ingredient, index) in ingredientRows" :key="index">
      <a-form-item>
        <a-select v-model:value="ingredient.ingredientVariantId" placeholder="Select Ingredient">
          <a-select-option v-for="variant in variants" :key="variant.id" :value="variant.id">
            {{ variant.sku }}
          </a-select-option>
        </a-select>
        <a-input-number v-model="ingredient.quantity" placeholder="Quantity" />
        <a-button @click="removeRow(index)" type="danger" icon="minus" />
      </a-form-item>
    </div>

    <!-- Button to add new ingredient row -->
    <a-form-item>
      <a-button @click="addRow" type="dashed" icon="plus">Add Ingredient</a-button>
    </a-form-item>

    <!-- Submit button -->
    <a-form-item>
      <a-button type="primary" html-type="submit">Submit</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useProductStore } from '~/stores/product/ProductStore.js'; // Update path as needed
const emit = defineEmits(['submit-success']);
const productStore = useProductStore();
productStore.fetchVariants()
const variants = productStore.variants; // Assuming variants are already fetched
const props = defineProps({
  variant_id: {
    type: Number,
    required: true,
  },
});
// Variant ID to which ingredients are being added
const variantId = ref(props.variant_id);
console.log("props.variant_id",props.variant_id)
// Dynamic ingredient rows (start with 1 empty row)
const ingredientRows = reactive([
  { ingredientVariantId: null, quantity: 1 }
]);

// Add a new row for ingredient input
const addRow = () => {
  ingredientRows.push({ ingredientVariantId: null, quantity: 1 });
};

// Remove a row by index
const removeRow = (index) => {
  ingredientRows.splice(index, 1);
};

// Submit form data
const submitForm = async () => {
  if (!variantId.value) {
    console.error('Please select a variant');
    return;
  }

  try {
    console.log("variantId.value, ingredientRows",props.variant_id, ingredientRows)
    // Call Pinia action to submit composition
    await productStore.createComposition(props.variant_id, ingredientRows);
    emit('submit-success');
  } catch (error) {
    console.error('Error adding composition', error);
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
