<!-- EditCompositionQuantity.vue -->
<template>

    <a-form :model="formState" :rules="rules" @finish="onFinish" @finishFailed="onFinishFailed">
      <p>
        {{composition?.ingredientVariant?.Product?.name}}
      </p>
      <a-form-item name="quantity" label="Quantity">
        <a-input-number v-model:value="formState.quantity" :min="0" :step="0.01" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="productStore.loading">
          Submit
        </a-button>
      </a-form-item>
    </a-form>

</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { useProductStore } from '@/stores/product/ProductStore.js'; // Adjust the import path as needed

const props = defineProps({
  compositionId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['submit-success']);

const productStore = useProductStore();
const formState = reactive({
  quantity: 0
});

const rules = {
  quantity: [{ required: true, message: 'Please input the quantity' }]
};
const composition = ref(null)
const fetchCompositionData = async () => {
  try {
    composition.value = await productStore.compositionById(parseInt(props.compositionId));
    console.log("composition",composition)
    formState.quantity = composition.value.quantity;
  } catch (error) {
    console.error('Error fetching composition data:', error);
    message.error('Failed to load composition data');
  }
};
fetchCompositionData()

// Watch for changes in the compositionId prop
watch(() => props.compositionId, (newCompositionId, oldCompositionId) => {
  if (newCompositionId !== oldCompositionId) {
    fetchCompositionData();
  }
}, { immediate: true });

const onFinish = async (values) => {
  try {
    await productStore.updateCompositionQuantity(props.compositionId, values.quantity);
    emit('submit-success');
  } catch (error) {
    console.error('Error updating quantity:', error);
    message.error('Failed to update quantity');
  }
};

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};


</script>
