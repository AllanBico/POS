<template>
  <div>
    <div>

    </div>
    <a-modal v-model:open="open" title="Add User" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"  cancel-text="Cancel">
      <user-add-modal @submit-success="handleSubmitSuccess"></user-add-modal>
      <template #footer>
      </template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit User" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"  cancel-text="Cancel">
      <UserEditModal :user_id="user_id" @submit-success="handleSubmitSuccess"></UserEditModal>
      <template #footer>
      </template>
    </a-modal>
  </div>
  <a-button class="editable-add-btn" style="margin-bottom: 8px" @click="handleAdd">Add</a-button>
  <a-table bordered :data-source="users" :columns="columns" @change="onChange">
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'operation'">
        <a-tooltip  title="Edit" placement="bottom">
          <a-button @click="onEdit(record.id)" style="margin-right: 3px"  :icon="h(EditOutlined)" />
        </a-tooltip>
        <a-popconfirm
            v-if="users.length"
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
import { computed, reactive, ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import UserAddModal from "~/components/users/userAddModal.vue";
import UserEditModal from "~/components/users/userEditModal.vue";
import { useUserStore } from '~/stores/useUserStore.js';
import {DeleteOutlined, EditOutlined} from "@ant-design/icons-vue";
const userStore = useUserStore();
const open = ref(false);
const edit_open = ref(false);
let user_id = ref(null)
defineProps({
  // Prop for an object
  users: {
    type: Object,
    required: true, // Adjust as needed
  },
});

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: '30%',
    sorter: {
      compare: (a, b) => a.name - b.name,
      multiple: 3,
    },
  },
  {
    title: 'Email',
    dataIndex: 'email',
  },
  {
    title: 'Created',
    dataIndex: 'created_at',
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
  await userStore.deleteUser(key)
  console.log("deleted",key)
};
const onEdit = async key => {
  console.log("edit",key)
  user_id =parseInt(key)
  console.log("user_id",user_id)
  edit_open.value = true
  console.log("done")
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
const handleSubmitSuccess = () => {
  open.value = false;
  edit_open.value = false;
};
function onChange(pagination, filters, sorter, extra) {
  console.log('params', pagination, filters, sorter, extra);
}
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