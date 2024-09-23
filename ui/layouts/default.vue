<template>
  <a-layout>
    <a-layout-sider
      v-model:collapsed="state.collapsed"
      :trigger="null"
      collapsible
      :style="{boxShadow: '2px 0 5px rgba(0,0,0,0.1)', overflow: 'auto', height: '100vh'}"
    >
      <div class="logo">
        <img src="https://its.intellitech.co.ke/static/logo.png" alt="Vue Antd Admin"/>
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
      <a-layout-content :style="{padding: '5px'}">
      <QuickActions/>
        <!-- Tabs -->
        <a-tabs v-model:activeKey="tabsStore.activeKey" :size="size" hide-add @edit="onEdit" type="editable-card">
          <a-tab-pane v-for="tab in tabsStore.tabs" :key="tab.key" :tab="tab.title" closable>
            <keep-alive>
              <component :is="tab.component" v-bind="tab.props" />
            </keep-alive>
          </a-tab-pane>
          <template #rightExtra>
            <a-card class="control-area" :bodyStyle="{ padding: '3px' }">
              <!-- Collapse Button -->
              <a-button type="primary" style="margin: 0px" @click="toggleCollapsed">
                <MenuUnfoldOutlined v-if="state.collapsed" />
                <MenuFoldOutlined v-else />
              </a-button>
            <ControlTab/>
            </a-card>
          </template>
        </a-tabs>
      </a-layout-content>

      <a-layout-footer style="text-align: center; padding: 10px 0;">
        Smart inventory ©2024 Intellitech LTD
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
  PieChartOutlined,
  MailOutlined,
  DesktopOutlined,
  InboxOutlined,
  AppstoreOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  PlusOutlined,
  CommentOutlined,
  BarChartOutlined,
  TagOutlined,
  GiftOutlined,
  BarcodeOutlined,
  StockOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  PercentageOutlined, ApartmentOutlined, ContactsOutlined,
} from '@ant-design/icons-vue';
import expensesTable from '~/components/expenses/expensesTable.vue';
import productsTable from '~/components/product/products/productsTable.vue';
import categoriesTable from '~/components/product/categories/categoriesTable.vue';
import brandsTable from '~/components/product/brands/brandsTable.vue';
import unitsTable from '~/components/product/units/unitsTable.vue';
import purchasesTable from '~/components/purchases/purchasesTable.vue';
import usersTable from '~/components/users/usersTable.vue';
import subCategoriesTable from '~/components/product/subcategories/subCategoriesTable.vue';
import attributesTable from '~/components/product/attributes/attributesTable.vue'
import warrantiesTable from '~/components/warranties/warrantiesTable.vue'
import customersTable from '~/components/customers/customersTable.vue'
import inventoriesTable from '~/components/inventory/inventoriesTable.vue'
import storesTable from '~/components/stores/storesTable.vue'
import suppliersTable from '~/components/suppliers/suppliersTable.vue'
import warehousesTable from '~/components/warehouses/warehousesTable.vue'
import paymentMethodsTable from '~/components/expenses/paymentMethodsTable.vue'
import expensesCategoriesTable from '~/components/expenses/expensesCategoriesTable.vue'
import GoodsReceivingTable from "~/components/inventory/receive/GoodsReceivingTable.vue";
import rolesTable from "~/components/users/roleandpermission/rolesTable.vue";
import variantsTable from '~/components/product/products/variantsTable.vue';
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
    icon: () => h(BarChartOutlined),
    label: 'Dashboard',
    title: 'Dashboard',
  },
  {
    type: 'divider',
    label: 'Inventory',
  },
  {
    key: 'Products',
    icon: () => h(TeamOutlined),
    label: 'Products',
    children: [
      {
        key: 'ProductsList',
        label: 'Products',
        onClick: () => addTab('Products', productsTable),
      },
      {
        key: 'Expired Products',
        label: 'Expired Products',
      },
      {
        key: 'Low Stocks',
        label: 'Low Stocks',
      },
      {
        key: 'Print Barcode',
        label: 'Print Barcode',
      },
    ],
  },
  {
    key: 'Categories',
    icon: () => h(ApartmentOutlined),
    label: 'Categories',
    children: [
      {
        key: 'Category',
        label: 'Category',
        onClick: () => addTab('Categories', categoriesTable),
      },
      {
        key: 'Sub Category',
        label: 'Sub Category',
        onClick: () => addTab('SubCategories', subCategoriesTable),
      },
    ],
  },
  {
    key: 'Brands',
    icon: () => h(PieChartOutlined),
    label: 'Brands',
    onClick: () => addTab('Brands', brandsTable),
  },
  {
    key: 'Units',
    icon: () => h(PieChartOutlined),
    label: 'Units',
    onClick: () => addTab('Units', unitsTable),
  },{
    key: 'Orders',
    icon: () => h(PieChartOutlined),
    label: 'Orders',
    onClick: () => addTab('Orders', OrderList),
  },
  {
    key: 'Variants',
    icon: () => h(PieChartOutlined),
    label: 'Variants',
    onClick: () => addTab('Variants', variantsTable),
  },{
    key: 'Serials',
    icon: () => h(PieChartOutlined),
    label: 'Serials',
    onClick: () => addTab('Serial Numbers', serialNumbers),
  },
  {
    key: 'Attributes',
    icon: () => h(PieChartOutlined),
    label: 'Attributes',
    onClick: () => addTab('Attributes', attributesTable),
  },
  {
    key: 'Warranties',
    icon: () => h(PieChartOutlined),
    label: 'Warranties',
    onClick: () => addTab('Warranties', warrantiesTable),
  },
  {
    key: 'coupons',
    icon: () => h(PieChartOutlined),
    label: 'Coupons',
    onClick: () => addTab('Coupons', couponsTable),
  },
  {
    type: 'divider',
    label: 'Stock',
  },
  {
    key: 'inventories',
    icon: () => h(PieChartOutlined),
    label: 'Inventories',
    onClick: () => addTab('Inventory', inventoriesTable),
  },
  {
    key: 'Received',
    icon: () => h(PieChartOutlined),
    label: 'Received',
    onClick: () => addTab('Goods Received', GoodsReceivingTable),
  },
  {
    key: 'stockTransfer',
    icon: () => h(PieChartOutlined),
    label: 'Stock Transfer',
    onClick: () => addTab('Stock Transfer', stockTransfer),
  },
  {
    key: 'stockTakes',
    icon: () => h(PieChartOutlined),
    label: 'Stock Take',
    onClick: () => addTab('Stock Takes', stockTakesTable),
  },
  {
    key: 'stockAdjustments',
    icon: () => h(PieChartOutlined),
    label: 'Stock Adjustments',
    onClick: () => addTab('Stock Adjustments', stockAdjustmentsTable),
  },
  {
    type: 'divider',
    label: 'Purchases',
  },
  {
    key: 'purchases',
    icon: () => h(PieChartOutlined),
    label: 'Purchases',
    onClick: () => addTab('Purchases', purchasesTable),
  },
  {
    type: 'divider',
    label: 'Finance & Accounts',
  },
  {
    key: 'expenses',
    icon: () => h(PieChartOutlined),
    label: 'Expenses',
    onClick: () => addTab('Expenses', expensesTable),
  },
  {
    key: 'expenses_categories',
    icon: () => h(PieChartOutlined),
    label: 'Expenses Categories',
    onClick: () => addTab('Expenses Categories', expensesCategoriesTable),
  },
  {
    key: 'payment_method',
    icon: () => h(PieChartOutlined),
    label: 'Payment Method',
    onClick: () => addTab('Payment Methods', paymentMethodsTable),
  },
  {
    type: 'divider',
    label: 'Sales',
  },
  {
    type: 'divider',
    label: 'Reports',
  },
  {
    type: 'divider',
    label: 'People',
  },
  {
    key: 'Users',
    icon: () => h(TeamOutlined),
    label: 'Users',
    children: [
      {
        key: 'Users',
        label: 'Users',
        onClick: () => addTab('Users', usersTable),
      },
      {
        key: 'Users Roles',
        label: 'Users Roles',
        onClick: () => addTab('User Roles', rolesTable),
      },
    ],
  },
  {
    key: 'Customers',
    icon: () => h(ContactsOutlined),
    label: 'Customers',
    onClick: () => addTab('Customers', customersTable),
  },
  {
    key: 'Suppliers',
    icon: () => h(PieChartOutlined),
    label: 'Suppliers',
    onClick: () => addTab('Suppliers', suppliersTable),
  },
  {
    key: 'Warehouses',
    icon: () => h(PieChartOutlined),
    label: 'Warehouses',
    onClick: () => addTab('Warehouses', warehousesTable),
  },
  {
    key: 'Stores',
    icon: () => h(PieChartOutlined),
    label: 'Stores',
    onClick: () => addTab('Stores', storesTable),
  },
  {
    key: 'Taxes',
    icon: () => h(PieChartOutlined),
    label: 'Taxes',
    onClick: () => addTab('Taxes', taxesTable),
  },
  {
    key: 'Settings',
    icon: () => h(SettingOutlined),
    label: 'Settings',
    children: [
      {
        key: 'settings',
        label: 'Barcode Settings',
        onClick: () => addTab('Settings', settings),
      },
      {
        key: 'Users Roles',
        label: 'Users Roles',
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

</script>

<style scoped>
/* Styling the Logo */
.logo {
  height: 50px;
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

</style>