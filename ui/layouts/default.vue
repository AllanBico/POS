<template>
  <a-layout style="min-height: 100vh;">
    <!-- Sidebar -->
    <a-layout-sider
      v-model:collapsed="state.collapsed"
      collapsible
      theme="light"
      :trigger="null"
      :style="{boxShadow: '2px 0 5px rgba(0,0,0,0.1)', overflow: 'auto'}"
      :breakpoint="'lg'"
      @breakpoint="handleBreakpoint"
    >
      <div class="logo">
        <img src="https://its.intellitech.co.ke/static/logo.png" alt="Smart Inventory"/>
      </div>
      <a-menu
        v-model:openKeys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        mode="inline"
        :inline-collapsed="state.collapsed"
        :items="filteredMenuItems"
      ></a-menu>
    </a-layout-sider>

    <!-- Main Layout -->
    <a-layout>

      <!-- Content -->
      <a-layout-content >
        <a-tabs v-model:activeKey="tabsStore.activeKey" :size="size" hide-add @edit="onEdit" type="editable-card">
          <a-tab-pane v-for="tab in tabsStore.tabs" :key="tab.key" :tab="tab.title" closable>
            <keep-alive>
              <component :is="tab.component" v-bind="tab.props" />
            </keep-alive>
          </a-tab-pane>
          <template #rightExtra>
            <a-card class="control-area" :bodyStyle="{ padding: '5px' }">
              <QuickActions/>
              <a-button type="primary" @click="toggleCollapsed" style="margin-right: 5px;">
                <MenuUnfoldOutlined v-if="state.collapsed" />
                <MenuFoldOutlined v-else />
              </a-button>
              <ControlTab/>
            </a-card>
          </template>
        </a-tabs>
      </a-layout-content>

      <!-- Footer -->
      <a-layout-footer style="text-align: center; padding: 10px 0; background: #f0f2f5;">
        Smart Inventory ©2024 Intellitech LTD
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, reactive, watch, h, computed } from 'vue';
import { useTabsStore } from '~/stores/tabsStore';
import { useAuthStore } from '~/stores/AuthStore'; // Import AuthStore
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  ShopOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  InboxOutlined,
  UserOutlined,
  ContactsOutlined,
  BankOutlined,
  HomeOutlined,
  PercentageOutlined,
} from '@ant-design/icons-vue';
import expensesTable from '~/components/expenses/expensesTable.vue';
import productsTable from '~/components/product/products/productsTable.vue';
import categoriesTable from '~/components/product/categories/categoriesTable.vue';
import brandsTable from '~/components/product/brands/brandsTable.vue';
import unitsTable from '~/components/product/units/unitsTable.vue';
import purchasesTable from '~/components/purchases/purchasesTable.vue';
import usersTable from '~/components/users/usersTable.vue';
import subCategoriesTable from '~/components/product/subcategories/subCategoriesTable.vue';
import attributesTable from '~/components/product/attributes/attributesTable.vue';
import warrantiesTable from '~/components/warranties/warrantiesTable.vue';
import customersTable from '~/components/customers/customersTable.vue';
import inventoriesTable from '~/components/inventory/inventoriesTable.vue';
import storesTable from '~/components/stores/storesTable.vue';
import suppliersTable from '~/components/suppliers/suppliersTable.vue';
import warehousesTable from '~/components/warehouses/warehousesTable.vue';
import paymentMethodsTable from '~/components/expenses/paymentMethodsTable.vue';
import expensesCategoriesTable from '~/components/expenses/expensesCategoriesTable.vue';
import GoodsReceivingTable from "~/components/inventory/receive/GoodsReceivingTable.vue";
import rolesTable from "~/components/users/roleandpermission/rolesTable.vue";
import variantsTable from '~/components/product/products/variants/variantsTable.vue';
import settings from '~/components/settings/settings.vue';
import stockTransfer from '~/components/inventory/stockTransfer.vue';
import taxesTable from "~/components/taxes/taxesTable.vue";
import stockTakesTable from "~/components/inventory/stockTake/stockTakesTable.vue";
import stockAdjustmentsTable from "~/components/inventory/stockTake/stock adjustment/stockAdjustmentsTable.vue";
import couponsTable from "~/components/coupons/couponsTable.vue";
import serialNumbers from "~/components/inventory/serialNumber/serialNumber.vue";
import OrderList from "~/components/sales/OrderList.vue";
import QuickActions from "~/components/layout/QuickActions.vue";
import ControlTab from "~/components/layout/ControlTab.vue";
import Dashboard from "~/components/Dashboard.vue";
import test from "~/components/test.vue";
import deliveriesTable from "~/components/delivery/deliveriesTable.vue";
const tabsStore = useTabsStore();
const authStore = useAuthStore(); // Initialize AuthStore

const state = reactive({
  collapsed: false,
  selectedKeys: ['1'],
  openKeys: ['sub1'],
  preOpenKeys: ['sub1'],
});

const size = ref('small');

// Filter menu items based on permissions
const filteredMenuItems = computed(() => {
  return menuItems.filter(item => {
    if (item.key === 'dashboard' || item.key === 'user_roles' || item.key === 'settings') return true;
    if (item.children) {
      // Filter children recursively
      item.children = item.children.filter(child => {
        if (child.children) {
          // If the child has its own children, filter them as well
          child.children = child.children.filter(grandChild => authStore.hasPermission(grandChild.key, 'read'));
          return authStore.hasPermission(child.key, 'read') || child.children.length > 0; // Include if parent has permission or has children
        }
        return authStore.hasPermission(child.key, 'read'); // Check permission for the child
      });
      // Check if the parent item has children after filtering
      if (item.children.length > 0) {
        return true; // Include parent if it has children
      }
      // If the parent has no children, check if the parent itself has permission
      return authStore.hasPermission(item.key, 'read');
    }
    return authStore.hasPermission(item.key, 'read'); // Check permission for the item
  });
});

const menuItems = [
  {
    key: 'dashboard',
    icon: () => h(DashboardOutlined),
    label: 'Dashboard',
    title: 'Dashboard',
    onClick: () => addTab('Dashboard', Dashboard),
  },
  {
    key: 'inventory',
    icon: () => h(ShopOutlined),
    label: 'Inventory',
    children: [
      {
        key: 'products',
        label: 'Products',
        onClick: () => addTab('Products', productsTable),
      },
      {
        key: 'categories',
        label: 'Categories',
        children: [
          {
            key: 'category',
            label: 'Categories',
            onClick: () => addTab('Categories', categoriesTable),
          },
          {
            key: 'subcategory',
            label: 'Sub Categories',
            onClick: () => addTab('SubCategories', subCategoriesTable),
          },
        ],
      },
      {
        key: 'brand',
        label: 'Brands',
        onClick: () => addTab('Brands', brandsTable),
      },
      {
        key: 'unit',
        label: 'Units',
        onClick: () => addTab('Units', unitsTable),
      },
      {
        key: 'variant',
        label: 'Variants',
        onClick: () => addTab('Variants', variantsTable),
      },
      {
        key: 'attribute',
        label: 'Attributes',
        onClick: () => addTab('Attributes', attributesTable),
      },
      {
        key: 'serial_number',
        label: 'Serial Numbers',
        onClick: () => addTab('Serial Numbers', serialNumbers),
      },
    ],
  },
  {
    key: 'stock',
    icon: () => h(InboxOutlined),
    label: 'Stock Management',
    children: [
      {
        key: 'inventory',
        label: 'Current Stock',
        onClick: () => addTab('Inventory', inventoriesTable),
      },
      {
        key: 'good_receiving',
        label: 'Goods Received',
        onClick: () => addTab('Goods Received', GoodsReceivingTable),
      },
      {
        key: 'stockTransfer',
        label: 'Stock Transfer',
        onClick: () => addTab('Stock Transfer', stockTransfer),
      },
      {
        key: 'stockTakes',
        label: 'Stock Take',
        onClick: () => addTab('Stock Takes', stockTakesTable),
      },
      {
        key: 'stockAdjustments',
        label: 'Stock Adjustments',
        onClick: () => addTab('Stock Adjustments', stockAdjustmentsTable),
      },
    ],
  },
  {
    key: 'purchases',
    icon: () => h(ShoppingCartOutlined),
    label: 'Purchases',
    onClick: () => addTab('Purchases', purchasesTable),
  },{
    key: 'deliveries',
    icon: () => h(ShoppingCartOutlined),
    label: 'Deliveries',
    onClick: () => addTab('Deliveries', deliveriesTable),
  },
  {
    key: 'sales',
    icon: () => h(DollarOutlined),
    label: 'Sales',
    children: [
      {
        key: 'Orders',
        label: 'Orders',
        onClick: () => addTab('Orders', OrderList),
      },
      {
        key: 'coupons',
        label: 'Coupons',
        onClick: () => addTab('Coupons', couponsTable),
      },
    ],
  },
  {
    key: 'finance',
    icon: () => h(BarChartOutlined),
    label: 'Finance',
    children: [
      {
        key: 'expense',
        label: 'Expenses',
        onClick: () => addTab('Expenses', expensesTable),
      },
      {
        key: 'expense_category',
        label: 'Expense Categories',
        onClick: () => addTab('Expense Categories', expensesCategoriesTable),
      },
      {
        key: 'payment_methods',
        label: 'Payment Methods',
        onClick: () => addTab('Payment Methods', paymentMethodsTable),
      },
    ],
  },
  {
    key: 'people',
    icon: () => h(TeamOutlined),
    label: 'People',
    children: [
      {
        key: 'user',
        label: 'Users',
        icon: () => h(UserOutlined),
        onClick: () => addTab('Users', usersTable),
      },
      {
        key: 'customer',
        label: 'Customers',
        icon: () => h(ContactsOutlined),
        onClick: () => addTab('Customers', customersTable),
      },
      {
        key: 'supplier',
        label: 'Suppliers',
        icon: () => h(BankOutlined),
        onClick: () => addTab('Suppliers', suppliersTable),
      },
    ],
  },
  {
    key: 'locations',
    icon: () => h(HomeOutlined),
    label: 'Locations',
    children: [
      {
        key: 'warehouse',
        label: 'Warehouses',
        onClick: () => addTab('Warehouses', warehousesTable),
      },
      {
        key: 'stores',
        label: 'Stores',
        onClick: () => addTab('Stores', storesTable),
      },
    ],
  },
  {
    key: 'settings',
    icon: () => h(SettingOutlined),
    label: 'Settings',
    children: [
      {
        key: 'general_settings',
        label: 'General Settings',
        onClick: () => addTab('Settings', settings),
      },
      {
        key: 'roles',
        label: 'User Roles',
        onClick: () => addTab('User Roles', rolesTable),
      },
      {
        key: 'warranty',
        label: 'Warranties',
        onClick: () => addTab('Warranties', warrantiesTable),
      },
      {
        key: 'Taxes',
        label: 'Taxes',
        icon: () => h(PercentageOutlined),
        onClick: () => addTab('Taxes', taxesTable),
      },
    ],
  },
];

watch(
  () => state.openKeys,
  (_val, oldVal) => {
    state.preOpenKeys = oldVal;
  },
);

const toggleCollapsed = () => {
  state.collapsed = !state.collapsed;
  state.openKeys = state.collapsed ? [] : state.preOpenKeys;
};

const addTab = (title, component) => {
  tabsStore.addTab(title, component);
};

const onEdit = (targetKey, action) => {
  if (action === 'remove') {
    tabsStore.removeTab(targetKey)
  }
};

const handleBreakpoint = (broken) => {
  state.collapsed = broken;
};

</script>

<style scoped>
/* Styling the Logo */
.logo {
  height: 64px;
  margin: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
}

.logo img {
  max-height: 100%;
}

/* Sider & Menu Styling */
.ant-layout-sider {
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.ant-menu-item:hover,
.ant-menu-item-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: #1890ff;
}

.ant-menu-item-selected {
  background-color: #1890ff;
  color: white;
  transition: background-color 0.3s ease;
}

/* Subtle hover effect */
a {
  color: white;
  transition: color 0.3s ease;
}

a:hover {
  color: #40a9ff;
}

/* 3D floating effect for active tab */
.ant-tabs-card .ant-tabs-tab-active {
  position: relative;
  background-color: blue;
  z-index: 1;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1),
  0 6px 6px rgba(0, 0, 0, 0.12); /* Add a subtle shadow */
  transform: translateY(-5px); /* Slight lift to create the 3D effect */
  transition: all 0.3s ease; /* Smooth transition effect */
  border-radius: 8px; /* Give it a more modern look with rounded corners */
}

/* Optional: Add subtle shadow to all other tabs for depth */
.ant-tabs-tab {
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.06);
}

/* Hover effect for non-active tabs */
.ant-tabs-tab:hover {
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ant-layout-sider {
    position: fixed;
    z-index: 1000;
    height: 100%;
  }

  .ant-layout-content {
    margin-left: 200px;
  }

  .ant-layout-sider-collapsed + .ant-layout .ant-layout-content {
    margin-left: 80px;
  }
}

@media (max-width: 576px) {
  .ant-layout-sider {
    width: 100%;
    height: auto;
  }

  .ant-layout-content {
    margin-left: 0;
  }

  .ant-layout-sider-collapsed + .ant-layout .ant-layout-content {
    margin-left: 0;
  }
}
</style>