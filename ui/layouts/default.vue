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
        :items="menuItems"
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
import { ref, reactive, watch, h } from 'vue';
import { useTabsStore } from '~/stores/tabsStore';
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
  SwapOutlined,
  AuditOutlined,
  FileTextOutlined,
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
const tabsStore = useTabsStore();

const state = reactive({
  collapsed: false,
  selectedKeys: ['1'],
  openKeys: ['sub1'],
  preOpenKeys: ['sub1'],
});

const size = ref('small');

const menuItems = [
  {
    key: 'dashboard',
    icon: () => h(DashboardOutlined),
    label: 'Dashboard',
    title: 'Dashboard',
    onClick: () => addTab('Dashboard', Dashboard),
  },
  {
    key: 'test',
    icon: () => h(DashboardOutlined),
    label: 'test',
    title: 'test',
    onClick: () => addTab('test', test),
  },
  {
    type: 'divider',
  },
  {
    key: 'inventory',
    icon: () => h(ShopOutlined),
    label: 'Inventory',
    children: [
      {
        key: 'ProductsList',
        label: 'Products',
        onClick: () => addTab('Products', productsTable),
      },
      {
        key: 'categories',
        label: 'Categories',
        children: [
          {
            key: 'Categories',
            label: 'Categories',
            onClick: () => addTab('Categories', categoriesTable),
          },
          {
            key: 'SubCategories',
            label: 'Sub Categories',
            onClick: () => addTab('SubCategories', subCategoriesTable),
          },
        ],
      },
      {
        key: 'Brands',
        label: 'Brands',
        onClick: () => addTab('Brands', brandsTable),
      },
      {
        key: 'Units',
        label: 'Units',
        onClick: () => addTab('Units', unitsTable),
      },
      {
        key: 'Variants',
        label: 'Variants',
        onClick: () => addTab('Variants', variantsTable),
      },
      {
        key: 'Attributes',
        label: 'Attributes',
        onClick: () => addTab('Attributes', attributesTable),
      },
      {
        key: 'Serials',
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
        key: 'inventories',
        label: 'Current Stock',
        onClick: () => addTab('Inventory', inventoriesTable),
      },
      {
        key: 'Received',
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
        key: 'expenses',
        label: 'Expenses',
        onClick: () => addTab('Expenses', expensesTable),
      },
      {
        key: 'expenses_categories',
        label: 'Expense Categories',
        onClick: () => addTab('Expense Categories', expensesCategoriesTable),
      },
      {
        key: 'payment_method',
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
        key: 'Users',
        label: 'Users',
        icon: () => h(UserOutlined),
        onClick: () => addTab('Users', usersTable),
      },
      {
        key: 'Customers',
        label: 'Customers',
        icon: () => h(ContactsOutlined),
        onClick: () => addTab('Customers', customersTable),
      },
      {
        key: 'Suppliers',
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
        key: 'Warehouses',
        label: 'Warehouses',
        onClick: () => addTab('Warehouses', warehousesTable),
      },
      {
        key: 'Stores',
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
        key: 'Users Roles',
        label: 'User Roles',
        onClick: () => addTab('User Roles', rolesTable),
      },
      {
        key: 'Taxes',
        label: 'Taxes',
        icon: () => h(PercentageOutlined),
        onClick: () => addTab('Taxes', taxesTable),
      },
      {
        key: 'Warranties',
        label: 'Warranties',
        onClick: () => addTab('Warranties', warrantiesTable),
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