<template>
  <div class="role-permissions-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Role Permissions"
        sub-title="Manage permissions for this role"
      >
        <template #extra>
          <a-button
            type="primary"
            @click="handleSubmit"
            :icon="h(SaveOutlined)"
            class="save-btn"
          >
            Save Changes
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <div class="permissions-container">
      <a-table
        :dataSource="permissionTableData"
        :columns="columns"
        :pagination="false"
        class="permission-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex !== 'module'">
            <a-checkbox
              v-if="column.dataIndex !== 'allowAll'"
              :checked="isPermissionChecked(record.moduleId, column.dataIndex)"
              @change="(e) => handlePermissionChange(record.moduleId, column.dataIndex, e.target.checked)"
            />
            <a-checkbox
              v-else
              :checked="isAllPermissionsChecked(record.moduleId)"
              @change="(e) => handleAllPermissionsChange(record.moduleId, e.target.checked)"
            />
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, h, onMounted } from 'vue';
import { useRoleStore } from '~/stores/RoleStore.js';
import { defineProps, defineEmits } from 'vue';
import { SaveOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  roleId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update-success']);

const roleStore = useRoleStore();
const selectedPermissions = ref({});

const columns = [
  { title: 'Modules', dataIndex: 'module', key: 'module' , align: 'left'},
  { title: 'Create', dataIndex: 'create', key: 'create', align: 'center' },
  { title: 'Edit', dataIndex: 'update', key: 'update', align: 'center' },
  { title: 'View', dataIndex: 'read', key: 'read', align: 'center' },
  { title: 'Delete', dataIndex: 'delete', key: 'delete', align: 'center' },
  { title: 'Allow All', dataIndex: 'allowAll', key: 'allowAll', align: 'center' },
];

const permissionTableData = computed(() => {
  return roleStore.permissions.map(model => ({
    key: model.id,
    moduleId: model.id,
    module: model.name,
  }));
});

const fetchRolePermissions = async () => {
  const fromDB = await roleStore.fetchRolesPermissions(parseInt(props.roleId));
  selectedPermissions.value = fromDB.reduce((acc, permissionId) => {
    const permission = roleStore.permissions.flatMap(m => m.Permission).find(p => p.id === permissionId);
    if (permission) {
      if (!acc[permission.modelId]) {
        acc[permission.modelId] = [];
      }
      acc[permission.modelId].push(permissionId);
    }
    return acc;
  }, {});
};

onMounted(() => {
  fetchRolePermissions();
});

const handleSubmit = async () => {
  try {
    const allSelectedPermissions = Object.values(selectedPermissions.value).flat();
    console.log("allSelectedPermissions",allSelectedPermissions.value)
    await roleStore.updatePermission(props.roleId, allSelectedPermissions);
    emit('update-success');
  } catch (error) {
    console.error('Error updating permissions:', error);
  }
};

const isPermissionChecked = (moduleId, permissionType) => {
  const modulePermissions = selectedPermissions.value[moduleId] || [];
  const permission = roleStore.permissions.find(m => m.id === moduleId)?.Permission.find(p => p.name.toLowerCase() === permissionType.toLowerCase());
  return permission ? modulePermissions.includes(permission.id) : false;
};

const isAllPermissionsChecked = (moduleId) => {
  const modulePermissions = selectedPermissions.value[moduleId] || [];
  const allPermissionTypes = ['create', 'read', 'update', 'delete'];
  const permissions = roleStore.permissions.find(m => m.id === moduleId)?.Permission || [];
  return allPermissionTypes.every(type => {
    const permission = permissions.find(p => p.name.toLowerCase() === type.toLowerCase());
    return permission ? modulePermissions.includes(permission.id) : false;
  });
};

const handlePermissionChange = (moduleId, permissionType, checked) => {
  if (!selectedPermissions.value[moduleId]) {
    selectedPermissions.value[moduleId] = [];
  }

  const permissions = roleStore.permissions.find(m => m.id === moduleId)?.Permission || [];
  const permission = permissions.find(p => p.name.toLowerCase() === permissionType.toLowerCase());

  if (permission) {
    if (checked) {
      selectedPermissions.value[moduleId].push(permission.id);
    } else {
      selectedPermissions.value[moduleId] = selectedPermissions.value[moduleId].filter(id => id !== permission.id);
    }
  }

  if (isAllPermissionsChecked(moduleId)) {
    selectedPermissions.value[moduleId] = permissions.map(p => p.id);
  }
};

const handleAllPermissionsChange = (moduleId, checked) => {
  const permissions = roleStore.permissions.find(m => m.id === moduleId)?.Permission || [];
  if (checked) {
    selectedPermissions.value[moduleId] = permissions.map(p => p.id);
  } else {
    selectedPermissions.value[moduleId] = [];
  }
};

watch(() => props.roleId, (newRoleId) => {
  if (newRoleId) {
    fetchRolePermissions();
  }
}, { immediate: true });

</script>

<style scoped>
.role-permissions-container {
  background-color: #f0f2f5;
  padding: 24px;
  border-radius: 8px;
}

.header-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header {
  padding: 16px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
}

.save-btn {
  font-size: 14px;
  height: 36px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.permissions-container {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.permission-table {
  width: 100%;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  color: #001529;
  font-weight: 600;
  text-align: center;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  text-align: center;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}

:deep(.ant-checkbox-wrapper) {
  display: flex;
  justify-content: center;
}

:deep(.ant-table-row:nth-child(even)) {
  background-color: #fafafa;
}

:deep(.ant-table-row:hover) {
  background-color: #e6f7ff;
}

:deep(.ant-checkbox-wrapper) {
  cursor: pointer;
}

:deep(.ant-checkbox) {
  cursor: pointer;
}

:deep(.ant-checkbox-input) {
  cursor: pointer;
}
</style>
