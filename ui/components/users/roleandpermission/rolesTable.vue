<template>
  <div>
    <a-modal v-model:open="open" title="Add Role" @ok="handleAddRole" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
      <role-add-modal @submit-success="handleSubmitSuccess"></role-add-modal>
      <template #footer>
      </template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit Role" @ok="handleEditRole" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
      <role-edit-modal :role_id="role_id" @submit-success="handleSubmitSuccess"></role-edit-modal>
      <template #footer>
      </template>
    </a-modal>
  </div>
  <a-button class="editable-add-btn" style="margin-bottom: 8px" @click="handleAdd">Add Role</a-button>
  <a-table bordered :data-source="roleStore.roles" :columns="columns" @change="onChange">
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'operation'">
        <a-tooltip  title="View" placement="bottom">
          <a-button @click="onView(record.id)" style="margin-right: 3px"  :icon="h(EyeOutlined)" />
        </a-tooltip>
        <a-tooltip title="Edit" placement="bottom">
          <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)" />
        </a-tooltip>
        <a-popconfirm
            v-if="roleStore.roles.length"
            title="Sure to delete?"
            @confirm="onDelete(record.id)">
          <a-tooltip title="Delete" placement="bottom">
            <a-button :icon="h(DeleteOutlined)" />
          </a-tooltip>
        </a-popconfirm>
      </template>
    </template>
  </a-table>
</template>
<script setup>
import { computed, ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import roleAddModal from "~/components/users/roleandpermission/roleAddModal.vue";
import roleEditModal from "~/components/users/roleandpermission/roleEditModal.vue";
import rolePermissions from "~/components/users/roleandpermission/rolePermissions.vue";
import { useRoleStore } from '~/stores/RoleStore.js';
import {DeleteOutlined, EditOutlined, EyeOutlined} from "@ant-design/icons-vue";
import {useTabsStore} from "~/stores/tabsStore.js";
const tabsStore = useTabsStore();
const roleStore = useRoleStore();
roleStore.fetchRoles()
const open = ref(false);
const edit_open = ref(false);
const role_id = ref(null);



const columns = [
  {
    title: 'Role Name',
    dataIndex: 'name',
    width: '30%',
    sorter: {
      compare: (a, b) => a.name.localeCompare(b.name),
      multiple: 3,
    },
  },
  {
    title: 'operation',
    dataIndex: 'operation',
  },
];

const onDelete = async key => {
  await roleStore.deleteRole(key);
  console.log("deleted", key);
};

const onEdit = async key => {
  console.log("edit", key);
  role_id.value = parseInt(key);
  console.log("role_id", role_id.value);
  edit_open.value = true;
  console.log("done");
};

const handleAdd = () => {
  open.value = true;
};

const handleAddRole = async () => {
  open.value = false;
  // Handle role creation logic here if necessary
};

const handleEditRole = async () => {
  edit_open.value = false;
  // Handle role editing logic here if necessary
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
const onView = async key => {
  tabsStore.addTab('Permissions', rolePermissions, { roleId: key });
};
</script>
