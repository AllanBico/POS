<template>
  <div class="user-role-assignment-container">

    <!-- Select Role -->
    <a-select
        v-model:value="selectedRoleId"
        placeholder="Select a Role"
        style="width: 100%"
        @change="handleRoleChange"
    >
      <a-select-option v-for="role in roleStore.roles" :key="role.id" :value="role.id">
        {{ role.name }}
      </a-select-option>
    </a-select>

    <!-- Assign Button -->
    <a-button
        type="primary"
        class="assign-role-btn"
        :disabled="!selectedRoleId"
        @click="assignRole"
    >
      Assign Role
    </a-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/UserStore';
import { useRoleStore } from '~/stores/RoleStore';
import { message } from 'ant-design-vue';

// Pinia stores
const userStore = useUserStore();
const roleStore = useRoleStore();
const props = defineProps({
  user_id: {
    type: Number,
    required: true,
  },
});

// Reactive properties
const selectedRoleId = ref(null);

// Methods
const fetchRole = async () => {
  try {
    const role = await roleStore.fetchRole(parseInt(props.user_id));
    if (role) {
      selectedRoleId.value = role.role_id;
    }
  } catch (error) {
    console.error('Failed to fetch role:', error);
    message.error('Failed to fetch role');
  }
};

const handleRoleChange = (roleId) => {
  selectedRoleId.value = roleId;
};

const assignRole = async () => {
  try {
    await roleStore.assignRoleToUser(parseInt(props.user_id), selectedRoleId.value);
    message.success('Role assigned successfully!');
  } catch (error) {
    console.error('Failed to assign role:', error);
    message.error('Failed to assign role');
  }
};

onMounted(async () => {
  await roleStore.fetchRoles();
  await fetchRole();
});
</script>

<style scoped>
.user-role-assignment-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.assign-role-btn {
  width: 100%;
  margin-top: 16px;
}
</style>