<template>
  <a-modal
      v-model:open="modalOpen"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
  >
    <!-- Render the selected component in the modal -->
    <component :is="currentComponent" @submit-success="handleSubmitSuccess"/>
    <template #footer></template>
  </a-modal>

  <a-float-button-group trigger="click" type="primary" :style="{ right: '24px' }">
    <template #icon>
      <PlusOutlined/>
    </template>

    <!-- Popover with submenu on the left side -->
    <a-popover placement="left" trigger="click" style="margin: 1px; padding: 1px;">
      <template #content>
        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
          <a-menu>
            <a-menu-item v-for="(item, index) in menuItems" :key="index" @click="showModal(item.component)">
              <item.icon />
              {{ item.label }}
            </a-menu-item>
          </a-menu>
        </div>
      </template>
      <a-float-button>
        <template #icon>
          <ProfileOutlined/>
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
import UnitsAddModal from "~/components/product/units/unitsAddModal.vue";
import CategoryAddModal from "~/components/product/categories/categoryAddModal.vue";
import CouponAddModal from "~/components/coupons/CouponAddModal.vue";
import CustomerAddModal from "~/components/customers/customerAddModal.vue";
import DeliveryAddModal from "~/components/delivery/deliveryAddModal.vue";
import AttributeAddModal from "~/components/product/attributes/attributeAddModal.vue";
import ProductAddModal from "~/components/product/products/productAddModal.vue";
import PurchaseOrderAddModal from "~/components/purchases/purchaseOrderAddModal.vue";

const modalOpen = ref(false);
const currentComponent = ref(null);

const menuItems = [
  { label: 'Create Brand', component: 'BrandAddModal', icon: TagOutlined },
  { label: 'Create Unit', component: 'UnitsAddModal', icon: GatewayOutlined },
  { label: 'Create Category', component: 'CategoryAddModal', icon: FolderOutlined },
  { label: 'Create Coupon', component: 'CouponAddModal', icon: FolderOutlined },
  { label: 'Create Customer', component: 'CustomerAddModal', icon: FolderOutlined },
  { label: 'Create Delivery', component: 'DeliveryAddModal', icon: FolderOutlined },
  { label: 'Create Attribute', component: 'AttributeAddModal', icon: FolderOutlined },
  { label: 'Create Product', component: 'ProductAddModal', icon: FolderOutlined },
  { label: 'Create Purchase Order', component: 'PurchaseOrderAddModal', icon: FolderOutlined },
];

const showModal = (component) => {
  const componentMap = {
    BrandAddModal,
    UnitsAddModal,
    CategoryAddModal,
    CouponAddModal,
    CustomerAddModal,
    DeliveryAddModal,
    AttributeAddModal,
    ProductAddModal,
    PurchaseOrderAddModal,
  };

  if (componentMap[component]) {
    currentComponent.value = markRaw(componentMap[component]);
    modalOpen.value = true;
  } else {
    console.error('Unknown component:', component);
  }
};

const handleOk = () => {
  modalOpen.value = false;
};

const handleCancel = () => {
  modalOpen.value = false;
};

const handleSubmitSuccess = () => {
  modalOpen.value = false;
};
</script>

<style scoped>
/* Add your styles if needed */
</style>
