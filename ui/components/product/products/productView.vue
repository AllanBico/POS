<template>
  <div class="product-view-container">
    <a-spin :spinning="productStore.loading">
      <template v-if="productStore.product">
        <!-- Header -->
        <a-card class="header-card" :bordered="false">
          <a-page-header
            class="header"
            :title="productStore.product.name"
            :sub-title="productStore.product.category.name"
          >
            <template #extra>
              <a-space>
                <a-button type="primary">
                  Edit Product
                </a-button>
                <a-button>
                  Delete Product
                </a-button>
              </a-space>
            </template>
          </a-page-header>
        </a-card>

        <!-- Product Summary -->
        <a-card class="summary-card" title="Product Summary" :bordered="false">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-statistic title="Brand" :value="productStore.product.brand.name" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="Category" :value="productStore.product.category.name" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="Subcategory" :value="productStore.product.subcategory?.name || 'N/A'" />
            </a-col>
          </a-row>
          <a-row :gutter="16" style="margin-top: 16px;">
            <a-col :span="8">
              <a-statistic title="Unit" :value="productStore.product.Unit?.name || 'N/A'" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="VAT Type" :value="productStore.product.VATType" />
            </a-col>
            <a-col :span="8">
              <a-statistic title="Composition">
                <template #value>
                  <a-tag :color="productStore.product.isComposition ? 'green' : 'red'">
                    {{ productStore.product.isComposition ? 'Yes' : 'No' }}
                  </a-tag>
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>

        <!-- Product Details -->
        <a-card class="details-card" title="Product Details" :bordered="false">
          <a-row :gutter="16">
            <a-col :span="24">
              <h4>Description</h4>
              <p>{{ productStore.product.description }}</p>
            </a-col>
          </a-row>
          <a-row :gutter="16" style="margin-top: 16px;">
            <a-col :span="12">
              <h4>Low Stock Alert</h4>
              <p>{{ productStore.product.lowStockAlert }}</p>
            </a-col>
            <a-col :span="12">
              <h4>Taxes</h4>
              <a-tag v-for="tax in productStore.product.taxes" :key="tax.id" style="margin-bottom: 8px;">
                {{ tax?.Tax?.name }}
              </a-tag>
            </a-col>
          </a-row>
        </a-card>

        <!-- Variants -->
        <a-card class="variants-card" title="Variants" :bordered="false">
          <a-table
            :dataSource="productStore.product.variants"
            :columns="variantColumns"
            :pagination="false"
            :rowKey="record => record.id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'images'">
                <a-image-preview-group>
                  <a-image
                    v-for="image in record.images"
                    :key="image.id"
                    :width="50"
                    :src="image.imageUrl"
                    :alt="record.name"
                  />
                </a-image-preview-group>
              </template>
              <template v-else-if="column.dataIndex === 'attributes'">
                <a-tag v-for="attr in record.variantAttributeValues" :key="attr.id" style="margin-bottom: 4px;">
                  {{ attr.attributeValue.attribute.name }}: {{ attr.attributeValue.value }}
                </a-tag>
              </template>
              <template v-else-if="column.dataIndex === 'inventory'">
                <a-tooltip v-for="inv in record.InventoryVariants" :key="inv.id" :title="inv.warehouse?.name || inv.store?.name">
                  <a-tag color="blue" style="margin-bottom: 4px;">{{ inv.quantity }}</a-tag>
                </a-tooltip>
              </template>
            </template>
          </a-table>
        </a-card>
      </template>
    </a-spin>
  </div>
</template>

<script setup>
import { useProductStore } from '~/stores/product/ProductStore.js';
import { onMounted, ref } from 'vue';

const productStore = useProductStore();
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const variantColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
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
    title: 'Stock',
    dataIndex: 'stockQuantity',
    key: 'stockQuantity',
  },
  {
    title: 'Images',
    dataIndex: 'images',
    key: 'images',
  },
  {
    title: 'Attributes',
    dataIndex: 'attributes',
    key: 'attributes',
  },
  {
    title: 'Inventory',
    dataIndex: 'inventory',
    key: 'inventory',
  },
];

onMounted(() => {
  productStore.fetchProduct(props.id);
});
</script>

<style scoped>
.product-view-container {
  background-color: #f0f2f5;
  padding: 24px;
}

.header-card,
.summary-card,
.details-card,
.variants-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header {
  padding: 16px;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
}

:deep(.ant-card-head-title) {
  padding: 16px 0;
  font-size: 16px;
  font-weight: 600;
}

:deep(.ant-card-body) {
  padding: 24px;
}

:deep(.ant-statistic-title) {
  color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-statistic-content) {
  font-size: 20px;
  font-weight: 600;
}

h4 {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 8px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  color: #001529;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}
</style>
