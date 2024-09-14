<template>
  <a-card :title="`Goods Received - ${goodsReceived?.id}`" class="goods-received-view">
    <a-descriptions column="2">
      <a-descriptions-item label="Purchase Order ID">
        <a @click="onValues(goodsReceived?.purchaseOrder?.id)">
        {{ goodsReceived?.purchaseOrder?.id }}</a>
      </a-descriptions-item>
      <a-descriptions-item label="Supplier ID">
        {{ goodsReceived?.purchaseOrder?.supplier?.name }}
      </a-descriptions-item>
      <a-descriptions-item label="Warehouse">
        {{ goodsReceived?.warehouse?.name }}
      </a-descriptions-item>
      <a-descriptions-item label="Store">
        {{ goodsReceived?.store?.name }}
      </a-descriptions-item>
      <a-descriptions-item label="Received Date">
        {{ goodsReceived?.receivedDate  }}
      </a-descriptions-item>
    </a-descriptions>

    <a-table :dataSource="lineItems" :columns="columns" rowKey="id">
      <a-table-column title="Variant SKU" :dataIndex="variantSku" />
      <a-table-column title="Received Quantity" dataIndex="receivedQuantity" />
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'serial'">
          <li v-for="serial in record.variant?.serialNumbers">
             *{{serial.serialNumber}}
          </li>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useGoodsReceivingStore } from '~/stores/GoodsReceivingStore.js';
import purchaseOrderView from "~/components/purchases/purchaseOrderView.vue";
const tabsStore = useTabsStore();
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
});

const goodsReceivingStore = useGoodsReceivingStore();
const goodsReceived = ref(null);
const lineItems = ref([]);
const onValues = async (key) => {
  tabsStore.addTab('Purchase Order', purchaseOrderView, { purchaseOrderId: key });
};
const columns = [
  { title: 'Variant SKU', dataIndex: 'variantSku', customRender: ({ record }) => record.variant.sku },
  { title: 'Received Quantity', dataIndex: 'receivedQuantity' },
  { title: 'Serial Number', dataIndex: 'serial', customRender: ({ record }) => record.variant? record.variant?.serialNumbers : ''},

];

const fetchData = async () => {
  goodsReceived.value = await goodsReceivingStore.goodsReceivedById(props.id);
  lineItems.value = goodsReceived.value.lineItems || [];
  console.log("lineItems.value",lineItems.value)
};

onMounted(fetchData);

watch(() => props.id, fetchData);
</script>

<style scoped>
.goods-received-view {
  margin: 20px;
}
</style>
