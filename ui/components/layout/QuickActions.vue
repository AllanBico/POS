<template>
  <a-modal v-model:open="modal_open" :title="modalTitle" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
    <!-- Render the selected component in the modal -->
    <component :is="currentComponent" @submit-success="handleSubmitSuccess" />
    <template #footer>
    </template>
  </a-modal>

  <a-float-button-group trigger="click" type="primary" :style="{ right: '24px' }">
    <template #icon>
      <PlusOutlined />
    </template>

    <!-- Popover with submenu on the left side -->
    <a-popover placement="left" trigger="click" style="margin: 1px;padding: 1px;">
      <template #content>
        <a-menu>
          <a-menu-item key="brand" @click="showModal('BrandAddModal', 'Create Brand')">
            <TagOutlined /> Create Brand
          </a-menu-item>
          <a-menu-item key="unit" @click="showModal('unitsAddModal', 'Create Unit')">
            <GatewayOutlined /> Create Unit
          </a-menu-item>
          <a-menu-item key="category" @click="showModal('CategoryAddModal', 'Create Category')">
            <FolderOutlined /> Create Category
          </a-menu-item>
        </a-menu>
      </template>
      <a-float-button>
        <template #icon>
          <ProfileOutlined />
        </template>
      </a-float-button>
    </a-popover>
  </a-float-button-group>
</template>

<script setup>
import { ref, markRaw } from 'vue';
import { PlusOutlined, TagOutlined, GatewayOutlined, FolderOutlined, ProfileOutlined } from "@ant-design/icons-vue";

// Import components that will be loaded dynamically in the modal
import BrandAddModal from "~/components/product/brands/brandAddModal.vue";
import unitsAddModal from "~/components/product/units/unitsAddModal.vue";
import CategoryAddModal from "~/components/product/categories/categoryAddModal.vue";

const modal_open = ref(false);
const currentComponent = ref(null);
const modalTitle = ref('');

const showModal = (component, title) => {
  switch (component) {
    case 'BrandAddModal':
      currentComponent.value = markRaw(BrandAddModal);
      break;
    case 'unitsAddModal':
      currentComponent.value = markRaw(unitsAddModal);
      break;
    case 'CategoryAddModal':
      currentComponent.value = markRaw(CategoryAddModal);
      break;
    default:
      console.error('Unknown component:', component);
      return;
  }
  modalTitle.value = title;
  modal_open.value = true;
};

const handleOk = () => {
  modal_open.value = false;
  // Optionally handle any additional logic here
};

const handleCancel = () => {
  modal_open.value = false;
};
const handleSubmitSuccess = () => {
  modal_open.value = false;
};
</script>

<style scoped>
/* Add your styles if needed */
</style>
