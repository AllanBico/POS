<template>
  <a-card :title="`Edit Goods Received`" class="goods-received-edit">
    <a-form :model="form" @submit.prevent="onSubmit">
<!--      <a-form-item label="Purchase Order ID">-->
<!--        <a-input v-model:value="form.purchaseOrderId" disabled />-->
<!--      </a-form-item>-->
      <a-form-item label="Warehouse">
        <a-select v-model:value="form.warehouseId">
          <a-select-option v-for="wh in warehouseStore.warehouses" :key="wh.id" :value="wh.id">
            {{ wh.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="Received Date">
        <a-date-picker v-model:value="form.receivedDate" value-format="YYYY-MM-DD"  />
      </a-form-item>
      <a-form-item label="Store">
        <a-select v-model:value="form.storeId">
          <a-select-option v-for="st in StoresStore.stores" :key="st.id" :value="st.id">
            {{ st.name }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" htmlType="submit">Save</a-button>
      </a-form-item>
    </a-form>

    <a-table :dataSource="lineItems" :columns="lineItemColumns" rowKey="id">
      <a-table-column title="Variant SKU" :dataIndex="variantSku" />
      <a-table-column title="Received Quantity" dataIndex="receivedQuantity" />
      <a-table-column title="Actions">
        <template #bodyCell="props">
          <a-button @click="removeLineItem(props.record.id)">Remove</a-button>
        </template>
      </a-table-column>
    </a-table>
  </a-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useGoodsReceivingStore } from '~/stores/goodsReceivingStore';
import {useWarehouseStore} from "~/stores/warehouse.js";
import {useStoreStore} from "~/stores/store.js";
const warehouseStore = useWarehouseStore();
const StoresStore = useStoreStore()
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
});

const goodsReceivingStore = useGoodsReceivingStore();
const goodsReceived = ref(null);
const form = ref({
  purchaseOrderId: '',
  warehouseId: '',
  receivedDate: '',
  storeId: '',
});
const lineItems = ref([]);
const warehouses = ref([]);
const stores = ref([]);

const lineItemColumns = [
  { title: 'Variant SKU', dataIndex: 'variantSku', customRender: ({ record }) => record.variant.sku },
  { title: 'Received Quantity', dataIndex: 'receivedQuantity' },
  { title: 'Actions' }
];

const fetchData = async () => {
  goodsReceived.value = await goodsReceivingStore.goodsReceivedById(props.id);
  form.value = { ...goodsReceived.value };

  lineItems.value = goodsReceived.value.lineItems || [];
  await warehouseStore.fetchWarehouses();
  await StoresStore.fetchStores()
};

const removeLineItem = async (id) => {
  await goodsReceivingStore.deleteLineItem(id);
  lineItems.value = lineItems.value.filter(item => item.id !== id);
};

const onSubmit = async () => {
  await goodsReceivingStore.updateGoodsReceived(form.value.id, form.value);
};

onMounted(fetchData);

watch(() => props.id, fetchData);
</script>

<style scoped>
.goods-received-edit {
  margin: 20px;
}
</style>
