<template>
  <div class="product-view">
    <a-spin :spinning="productStore.loading">
      <a-card v-if="productStore.product" class="product-card">
        <a-page-header
          :title="productStore.product.name"
          :sub-title="productStore.product.category.name"
          class="page-header"
        />
        <a-descriptions title="Product Details" bordered column="2">
          <a-descriptions-item label="Name">{{ productStore.product.name }}</a-descriptions-item>
          <a-descriptions-item label="Description">{{ productStore.product.description }}</a-descriptions-item>
          <a-descriptions-item label="Brand">{{ productStore.product.brand.name }}</a-descriptions-item>
          <a-descriptions-item label="Category">{{ productStore.product.category.name }}</a-descriptions-item>
          <a-descriptions-item label="Subcategory">{{ productStore.product.subcategory?.name }}</a-descriptions-item>
          <a-descriptions-item label="Unit">{{ productStore.product.Unit?.name }}</a-descriptions-item>
          <a-descriptions-item label="Low Stock Alert">{{ productStore.product.lowStockAlert }}</a-descriptions-item>
          <a-descriptions-item label="VAT Type">{{ productStore.product.VATType }}</a-descriptions-item>
          <a-descriptions-item label="Is Composition">{{ productStore.product.isComposition ? 'Yes' : 'No' }}</a-descriptions-item>
          <a-descriptions-item label="Created At">{{ new Date(productStore.product.createdAt).toLocaleString() }}</a-descriptions-item>
          <a-descriptions-item label="Updated At">{{ new Date(productStore.product.updatedAt).toLocaleString() }}</a-descriptions-item>
          <a-descriptions-item label="Variants">
            <ul>
              <li v-for="variant in productStore.product.variants" :key="variant.id">
                {{ variant.name }} - SKU: {{ variant.sku }} - Price: {{ variant.price }} - Stock: {{ variant.stockQuantity }}
                <ul>
                  <li v-for="image in variant.images" :key="image.id">
                    <img :src="image.imageUrl" alt="Variant Image" class="variant-image"/>
                  </li>
                  <li v-for="attribute in variant.variantAttributeValues" :key="attribute.id">
                    {{ attribute.attributeValue.attribute.name }}: {{ attribute.attributeValue.value }}
                  </li>
                  <li v-for="inventory in variant.InventoryVariants" :key="inventory.id">
                    Location: {{ inventory.warehouse?.name || inventory.store?.name }} - Quantity: {{ inventory.quantity }}
                  </li>
                </ul>
              </li>
            </ul>
          </a-descriptions-item>
          <a-descriptions-item label="Taxes">
            <ul>
              <li v-for="tax in productStore.product.taxes" :key="tax.id">
                {{ tax?.Tax?.name }}
              </li>
            </ul>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </a-spin>
  </div>
</template>

<script setup>
import { useProductStore } from '~/stores/product/ProductStore.js';
import { onMounted } from 'vue';

const productStore = useProductStore();
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

onMounted(() => {
  productStore.fetchProduct(props.id);
});
</script>

<style scoped>
.product-view {
  padding: 20px;
  background-color: #f0f2f5;
}

.product-card {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.variant-image {
  max-width: 100px;
  margin: 5px;
}
</style>
