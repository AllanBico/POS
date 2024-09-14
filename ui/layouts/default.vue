<template>
  <a-layout :theme="{ colorPrimary: 'blue' }">
    <a-layout-sider
        theme="light"
        breakpoint="lg"
        collapsed-width="0"
        @collapse="onCollapse"
        @breakpoint="onBreakpoint"
        :style="{boxShadow: '2px 0 5px rgba(0,0,0,0.1)',overflow: 'auto', height: '100vh',}"
    >
      <div class="logo">
        <img src="https://its.intellitech.co.ke/static/logo.png" alt="Vue Antd Admin"/>
      </div>

      <a-menu
          theme="light"
          mode="inline"
          :style="{borderRight: 'none'}"
      >
        <!-- Dashboard Menu Item -->
        <a-menu-item key="dashboard">
          <a to="/">
            <bar-chart-outlined/>
            <span>Dashboard</span>
          </a>
        </a-menu-item>
        <a-divider style="border-color: black;color: black;">Inventory</a-divider>
        <a-sub-menu key="Products">
          <template #title>
            <span>
              <team-outlined/>
              <span>Products</span>
            </span>
          </template>
          <a-menu-item key="ProductsList"><a @click="addTab('Products', productsTable)">Products</a></a-menu-item>
          <a-menu-item key="Expired Products">Expired Products</a-menu-item>
          <a-menu-item key="Low Stocks">Low Stocks</a-menu-item>
          <a-menu-item key="Print Barcode">Print Barcode</a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="Categories">
          <template #title>
            <span>
              <apartment-outlined/>
              <span>Categories</span>
            </span>
          </template>
          <a-menu-item key="Category">
            <a @click="addTab('Categories', categoriesTable)">Category</a>
          </a-menu-item>
          <a-menu-item key="Sub Category">
            <a @click="addTab('SubCategories', subCategoriesTable)">Sub Category</a>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="Brands">
          <a @click="addTab('Brands', brandsTable)">
            <pie-chart-outlined/>
            <span>Brands</span>
          </a>
        </a-menu-item>
        <a-menu-item key="Units">
          <a @click="addTab('Units', unitsTable)">
            <pie-chart-outlined/>
            <span>Units</span>
          </a>
        </a-menu-item>
        <a-menu-item key="Variants">
          <a to="/variants">
            <pie-chart-outlined/>
            <span>Variants</span>
          </a>
        </a-menu-item>
        <a-menu-item key="Attributes">
          <a @click="addTab('Attributes', attributesTable)">
            <pie-chart-outlined/>
            <span>Attributes</span>
          </a>
        </a-menu-item>
        <a-menu-item key="Warranties">
          <a @click="addTab('Warranties', warrantiesTable)">
            <pie-chart-outlined/>
            <span>Warranties</span>
          </a>
        </a-menu-item>

        <a-divider style="border-color: black;color: black;">Stock</a-divider>
        <a-menu-item key="inventories">
          <a @click="addTab('Inventory', inventoriesTable)">
            <pie-chart-outlined/>
            <span>Inventories</span>
          </a>
        </a-menu-item>
        <a-menu-item key="Received">
          <a @click="addTab('Goods Received', GoodsReceivingTable)">
            <pie-chart-outlined/>
            <span>Received</span>
          </a>
        </a-menu-item>
        <a-divider style="border-color: black;color: black;">Purchases</a-divider>
        <a-menu-item key="purchases">
          <a @click="addTab('Purchases', purchasesTable)">
            <pie-chart-outlined/>
            <span>Purchases</span>
          </a>
        </a-menu-item>
        <a-divider style="border-color: black;color: black;">Finance & Accounts</a-divider>
        <a-menu-item key="expenses">
          <a @click="addTab('Expenses', expensesTable)">
            <pie-chart-outlined/>
            <span>Expenses</span>
          </a>
        </a-menu-item>
        <a-menu-item key="expenses_categories">
          <a @click="addTab('Expenses Categories', expensesCategoriesTable)">
            <pie-chart-outlined/>
            <span>Expenses Categories</span>
          </a>
        </a-menu-item>
        <a-menu-item key="payment_method">
          <a @click="addTab('Payment Methods', paymentMethodsTable)">
            <pie-chart-outlined/>
            <span>Payment Method</span>
          </a>
        </a-menu-item>
        <a-divider style="border-color: black;color: black;">Sales</a-divider>
        <a-divider style="border-color: black;color: black;">Reports</a-divider>
        <a-divider style="border-color: black;color: black;">People</a-divider>
        <a-sub-menu key="Users">
          <template #title>
            <span>
              <team-outlined/>
              <span>Users</span>
            </span>
          </template>
          <a-menu-item key="Users">
            <a @click="addTab('Users', usersTable)">Users</a>
          </a-menu-item>
          <a-menu-item key="Users Roles" @click="addTab('User Roles', rolesTable)">Users Roles</a-menu-item>
        </a-sub-menu>
        <a-menu-item key="Customers">
          <a @click="addTab('Customers', customersTable)">
            <contacts-outlined/>
            <span>Customers</span>
          </a>
        </a-menu-item>
        <a-menu-item key="Suppliers">
          <a @click="addTab('Suppliers', suppliersTable)">
            <pie-chart-outlined/>
            <span>Suppliers</span>
          </a>
        </a-menu-item>
        <a-menu-item key="Warehouses">
          <a @click="addTab('Warehouses', warehousesTable)">
            <pie-chart-outlined/>
            <span>Warehouses</span>
          </a>
        </a-menu-item>
        <a-menu-item key="Stores">
          <a @click="addTab('Stores', storesTable)">
            <pie-chart-outlined/>
            <span>Stores</span>
          </a>
        </a-menu-item>
        <a-sub-menu key="Settings">
          <template #title>
            <span>
              <setting-outlined/>
              <span>Settings</span>
            </span>
          </template>
          <a-menu-item key="setttings1">
            <a to="/settings">Barcode Settings</a>
          </a-menu-item>
          <a-menu-item key="Users Roles">Users Roles</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <!-- Main Layout -->
    <a-layout theme="dark" style="min-height: 100vh; background-image: linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);">
      <a-layout-content :style="{padding: '5px'}">
<!--        <page-header :style="{ background: '#fff', padding: '20px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'}" />-->
        <a-float-button-group trigger="click" type="primary" :style="{ right: '24px' }">
          <template #icon1>
            <PlusOutlined />
          </template>
          <!-- Popover with submenu on the left side -->
          <a-popover placement="left" trigger="click" style="margin: 1px;padding: 1px;">
            <template #content>
              <ul>
                <li>order1</li>
                <li>receive1</li>
                <li>unit1</li>
              </ul>
            </template>
            <a-float-button>
              <template #icon1>
                <CommentOutlined />
              </template>
            </a-float-button>
          </a-popover>
          <template #icon>
            <PlusOutlined />
          </template>
          <!-- Popover with submenu on the left side -->
          <a-popover placement="left" trigger="click" style="margin: 1px;padding: 1px;">
            <template #content>
              <ul>
                <li>order</li>
                <li>receive</li>
                <li>unit</li>
              </ul>
            </template>
            <a-float-button>
              <template #icon>
                <CommentOutlined />
              </template>
            </a-float-button>
          </a-popover>
        </a-float-button-group>
        <!-- Tabs -->
        <a-tabs v-model:activeKey="tabsStore.activeKey" :size="size" hide-add @edit="onEdit" type="editable-card">
          <a-tab-pane v-for="tab in tabsStore.tabs" :key="tab.key" :tab="tab.title" closable>
            <keep-alive>
              <component :is="tab.component" v-bind="tab.props" />
            </keep-alive>
          </a-tab-pane>
          <template #rightExtra>

            <div >
              <a-badge count="4" dot>
                <a-button type="link" :icon="h(BellOutlined)" />

              </a-badge>
              <a-button type="link" :icon="h(SettingOutlined)" />
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="settings">Settings</a-menu-item>
                    <a-menu-item key="logout">Logout</a-menu-item>
                  </a-menu>
                </template>
                <a-avatar style="background-color: #87d068" class="header-avatar" :icon="h(UserOutlined)" />
              </a-dropdown>
            </div>
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
import { ref } from 'vue';
import { useTabsStore } from '~/stores/tabsStore';
const tabsStore = useTabsStore();
import expensesTable from '~/components/expenses/expensesTable.vue';
import productsTable from '~/components/products/productsTable.vue';
import categoriesTable from '~/components/categories/categoriesTable.vue';
import brandsTable from '~/components/brands/brandsTable.vue';
import unitsTable from '~/components/units/unitsTable.vue';
import purchasesTable from '~/components/purchases/purchasesTable.vue';
import usersTable from '~/components/users/usersTable.vue';
import subCategoriesTable from '~/components/subcategories/subCategoriesTable.vue';
import attributesTable from '~/components/attributes/attributesTable.vue'
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
import {BellOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons-vue";

const collapsed = ref(false);



const size = ref('small');
const activeKey = ref('1');  // Default active tab
const tabs = ref([
  { key: '1', title: 'Dashboard', component: expensesTable }
]);

// Function to add a new tab dynamically
const addTab = (title, component) => {
  //const existingTab = tabs.value.find(tab => tab.title === title);
 // if (!existingTab && tabs.value.length < 4) {  // Max 4 tabs
 //  if (!existingTab) {  // Max 4 tabs
 //    const newKey = String(tabs.value.length + 1);

    tabsStore.addTab(title, component);
  //   activeKey.value = newKey;
  // } else if (existingTab) {
  //   activeKey.value = existingTab.key;  // If the tab already exists, just activate it
  // }
};

const onEdit = (targetKey, action) => {
  if (action === 'remove') {
    tabsStore.removeTab(targetKey)
  }
};

const onCollapse = (collapsed, type) => {
  console.log(collapsed, type);
};

const onBreakpoint = (broken) => {
  console.log(broken);
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
</style>
