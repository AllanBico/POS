<template>
  <a-card :loading="loading" title="Compositions">
    <a-table :columns="columns" :data-source="compositions" row-key="id">
      <template #actions="{ record }">
        <a-button @click="viewComposition(record.id)">View</a-button>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {useProductStore} from "~/stores/product/ProductStore.js";
const productStore = useProductStore();
const props = defineProps({
  variant_id: {
    type: Number,
    required: true
  }
});

const compositions = ref([]);
const loading = ref(true);


const columns = [
  {
    title: 'Ingredient Variant ID',
    dataIndex: 'ingredientVariantId',
    key: 'ingredientVariantId'
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity'
  },
  {
    title: 'Actions',
    key: 'actions',
    scopedSlots: { customRender: 'actions' }
  }
];

const fetchCompositions = async () => {
  try {
    compositions.value = await productStore.fetchCompositionsByVariantId(parseInt(props.variant_id)) ;
    console.log("compositions.value",compositions.value)
  } catch (err) {
    console.error('Error fetching compositions:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCompositions();
});
</script>
