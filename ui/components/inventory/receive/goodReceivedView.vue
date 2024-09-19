<template>
  <a-drawer
      v-model:open="open"
      class="custom-class"
      root-class-name="root-class-name"
      :root-style="{ color: 'blue' }"
      style="color: red"
      title="Barcode printer"
      placement="top"
      :size="size"
      :height="size"
      @after-open-change="afterOpenChange"
  >
  <barcode-print   :variant_obj="variant_obj"/>
  </a-drawer>
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
        <template v-if="column.dataIndex === 'operation'">
          <a-tooltip title="Edit" placement="bottom">
            <a-button @click="onBarcode(record?.variant?.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
          </a-tooltip>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useGoodsReceivingStore } from '~/stores/invetory/GoodsReceivingStore.js';
import purchaseOrderView from "~/components/purchases/purchaseOrderView.vue";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons-vue";
import BarcodePrint from "~/components/BarcodePrint.vue";
const tabsStore = useTabsStore();
const size = 700
const props = defineProps({
  id: {
    type: Number,
    required: true
  }
});
const variant_obj = ref(null)
const open = ref(false);
const goodsReceivingStore = useGoodsReceivingStore();
const goodsReceived = ref(null);
const lineItems = ref([]);
const onValues = async (key) => {
  tabsStore.addTab('Purchase Order', purchaseOrderView, { purchaseOrderId: key });
};
const columns = [
  { title: 'Variant SKU', dataIndex: 'variantSku', customRender: ({ record }) => record.variant.sku },
  { title: 'Received Quantity', dataIndex: 'receivedQuantity' },
  { title: 'Serial Number', dataIndex: 'serial', customRender: ({ record }) => record.variant? record.variant?.serialNumbers : ''}
  ,{
    title: 'operation',
    dataIndex: 'operation',
    key: 'operation',
  },

];

const fetchData = async () => {
  goodsReceived.value = await goodsReceivingStore.goodsReceivedById(props.id);
  lineItems.value = goodsReceived.value.lineItems || [];
  console.log("goodsReceived.value",goodsReceived.value)
  console.log("lineItems.value",lineItems.value)
};
function getVariant(id) {
  const obj = lineItems.value.find(item => item.variant.id === id);

  if (!obj) {
    return null; // Return null if no object with the given id is found
  }

  // Create a new object with only the necessary properties
  const result = obj;
  return result;
}

onMounted(fetchData);

watch(() => props.id, fetchData);

const onBarcode = async key => {
  console.log("barcode", key)
  variant_obj.value = getVariant(key)
  //console.log("variant_obj.value",getVariant(key))
  open.value = true;
};


const afterOpenChange = bool => {
  console.log('open', bool);
};

</script>

<style scoped>
.goods-received-view {
  margin: 20px;
}
</style>
