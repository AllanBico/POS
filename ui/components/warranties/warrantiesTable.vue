<template>
  <div>
    <a-modal v-model:open="open" title="Add User" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <WarrantyAddModal  @submit-success="handleSubmitSuccess"></WarrantyAddModal>
      <template #footer>
      </template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit User" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <WarrantyEditModal @submit-success="handleSubmitSuccess" :warranty_id="warranty_id"></WarrantyEditModal>
      <template #footer>
      </template>
    </a-modal>
  </div>
  <div>
  </div>
  <a-button class="editable-add-btn" style="margin-bottom: 1px ;margin-top: 1px ;" @click="handleAdd">Add</a-button>
  <a-table bordered :data-source="WarrantyStore.warranties" :columns="columns">

    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'status'">
        <span>
          <a-tag
              :key="record.id"
              :color="record.status ? 'success' : 'error'"
          >
          {{ record.status ? 'Active' : 'Inactive' }}
        </a-tag>

        </span>
      </template>
      <template v-else-if="column.dataIndex === 'operation'">
        <a-tooltip  title="Edit" placement="bottom">
          <a-button @click="onEdit(record.id)" style="margin-right: 3px"  :icon="h(EditOutlined)" />
        </a-tooltip>
        <a-popconfirm
            v-if="WarrantyStore.warranties.length"
            title="Sure to delete?"
            @confirm="onDelete(record.id)" >
          <a-tooltip title="Delete" placement="bottom">
            <a-button  :icon="h(DeleteOutlined)" />
          </a-tooltip>
        </a-popconfirm>
      </template>
    </template>
  </a-table>
</template>
<script setup>
import {computed, reactive, ref} from 'vue';
import {cloneDeep} from 'lodash-es';

const open = ref(false);
const edit_open = ref(false);
let warranty_id = ref(null)
import {useWarrantyStore} from '~/stores/WarrantyStore.js';
import WarrantyAddModal from '~/components/warranties/warrantyAddModal.vue'
import WarrantyEditModal from '~/components/warranties/WarrantyEditModal.vue'
import {DeleteOutlined, EditOutlined} from "@ant-design/icons-vue";
const WarrantyStore = useWarrantyStore();
WarrantyStore.fetchWarranties()
console.log("WarrantyStore.warranties",WarrantyStore.warranties)
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: '30%',
  },
  {
    title: 'Description',
    dataIndex: 'description',
  },
  {
    title: 'Duration',
    dataIndex: 'duration',
  },
  {
    title: 'Period',
    dataIndex: 'periods',
  },
  {
    title: 'Status',
    dataIndex: 'status',
  },
  {
    title: 'operation',
    dataIndex: 'operation',
  },
];


const edit = key => {
};
const save = key => {
};
const onDelete = async key => {
  await WarrantyStore.deleteWarranty(key)
  console.log("deleted", key)
};
const onEdit = async key => {
  console.log("edit", key)
  warranty_id = parseInt(key)
  console.log("warranty_id", warranty_id)
  edit_open.value = true
  console.log("done")
};

const handleAdd = () => {
  warranty_id.value = null;
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
const handleSubmitSuccess = () => {
  open.value = false;
  edit_open.value = false;
};
</script>
<style lang="less" scoped>
.editable-cell {
  position: relative;

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>