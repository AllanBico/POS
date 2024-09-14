<template>
  <a-modal v-model:open="visible" title="Assign Permissions" @ok="handleSubmit" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
    <a-form :form="form">
      <a-form-item label="Permissions">
        <a-checkbox-group v-model:value="selectedPermissions">
          <a-row>
            <a-col :span="8" v-for="permission in roleStore.permissions" :key="permission.id">
              <a-checkbox :value="permission.id">{{ permission.name }}</a-checkbox>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoleStore } from '~/stores/RoleStore.js';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  roleId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update-success']);

const roleStore = useRoleStore();

const visible = ref(false);
const form = ref({});
const selectedPermissions = ref([]);



const fetchRolePermissions = async () => {
  const role = await roleStore.getRole(props.roleId);
  selectedPermissions.value = role.permissions.map(p => p.id);
};
  
const handleSubmit = async () => {
  try {
    await roleStore.updateRolePermissions(props.roleId, selectedPermissions.value);
    emit('update-success');
  } catch (error) {
    console.error('Error updating permissions:', error);
  }
};

const handleCancel = () => {
  visible.value = false;
};

watch(() => props.roleId, (newRoleId) => {
  if (newRoleId) {
    fetchPermissions();
    fetchRolePermissions();
  }
}, { immediate: true });

</script>

<style scoped>
/* Add any custom styles if needed */
</style>
