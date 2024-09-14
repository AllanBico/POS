<template>
  <div>
    <a-table bordered :data-source="goodsReceivedList" :columns="columns">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-tooltip  title="View" placement="bottom">
            <a-button @click="onView(record.id)" style="margin-right: 3px"  :icon="h(EyeOutlined)" />
          </a-tooltip>
          <a-tooltip  title="Edit" placement="bottom">
            <a-button @click="onEdit(record.id)" style="margin-right: 3px"  :icon="h(EditOutlined)" />
          </a-tooltip>
          <a-popconfirm
              v-if="goodsReceivedList.length"
              title="Sure to delete?"
              @confirm="onDelete(record.id)" >
            <a-tooltip title="Delete" placement="bottom">
              <a-button  :icon="h(DeleteOutlined)" />
            </a-tooltip>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGoodsReceivingStore } from '~/stores/GoodsReceivingStore.js';
import {DeleteOutlined, EditOutlined,EyeOutlined} from "@ant-design/icons-vue";
import purchaseOrderView from "~/components/purchases/purchaseOrderView.vue";
import GoodsReceivingForm from "~/components/inventory/receive/GoodsReceivingAdd.vue";
import goodReceivedEdit from "~/components/inventory/receive/goodReceivedEdit.vue";
import goodsReceivedView from "~/components/inventory/receive/goodReceivedView.vue";
import {useTabsStore} from "~/stores/tabsStore.js";
const goodsReceivingStore = useGoodsReceivingStore();
const goodsReceivedList = ref([]);
const tabsStore = useTabsStore();
// Fetch all GRNs
goodsReceivingStore.fetchGoodsReceived().then(() => {
  goodsReceivedList.value = goodsReceivingStore.goodsReceived;
  console.log("goodsReceivedList.value",goodsReceivedList.value)
});
const columns = [
  {
    title: 'receivedDate',
    dataIndex: 'receivedDate',
    key:'receivedDate',
  },
  {
    title: 'warehouse',
    customRender: ({record}) => record.warehouse ? record.warehouse.name : '',
  },
  {
    title: 'status',
    dataIndex: 'status',
  },
  {
    title: 'operation',
    dataIndex: 'operation',
  },
];
const onEdit = async key => {
  tabsStore.addTab('Edit Good Received', goodReceivedEdit, { id: key });
};
const onView = async key => {
  tabsStore.addTab('Good Received', goodsReceivedView, { id: key });
};
const edit = key => {
};
const save = key => {
};
const onDelete = async key => {
  //await goodsReceivingStore.deleteUnit(key)
  console.log("deleted",key)
};


const handleAdd = () => {
  open.value = true;
};
const handleOk = () => {
  open.value = false;
  // Optionally handle any additional logic here
};
const handleCancel = () => {
  open.value = false;
  edit_open.value = false;
};
</script>
