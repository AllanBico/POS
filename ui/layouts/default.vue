<template>
  <a-layout>
    <a-layout-sider
        theme="light"
        breakpoint="lg"
        collapsed-width="0"
        @collapse="onCollapse"
        @breakpoint="onBreakpoint"
        :style="{boxShadow: '2px 0 5px rgba(0,0,0,0.1)',overflow: 'auto', height: '100vh',}"
    >
      <div class="logo">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg" alt="Vue Antd Admin"/>
      </div>

      <a-menu
          theme="light"
          mode="inline"
          :style="{borderRight: 'none'}"
      >
        <!-- Dashboard Menu Item -->
        <a-menu-item key="dashboard">
          <NuxtLink to="/">
            <bar-chart-outlined/>
            <span>Dashboard</span>
          </NuxtLink>
        </a-menu-item>
        <a-divider style="border-color: whitesmoke;color: whitesmoke;">Inventory</a-divider>
        <a-sub-menu key="Products">
          <template #title>
            <span>
              <team-outlined/>
              <span>Products</span>
            </span>
          </template>
          <a-menu-item key="ProductsList"><NuxtLink to="/products">Products</NuxtLink></a-menu-item>
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
            <NuxtLink to="/categories">Category</NuxtLink>
          </a-menu-item>
          <a-menu-item key="Sub Category">
            <NuxtLink to="/subcategories">Sub Category</NuxtLink>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="Brands">
          <NuxtLink to="/brands">
            <pie-chart-outlined/>
            <span>Brands</span>
          </NuxtLink>
        </a-menu-item>
        <a-menu-item key="Units">
          <NuxtLink to="/units">
            <pie-chart-outlined/>
            <span>Units</span>
          </NuxtLink>
        </a-menu-item>
        <a-menu-item key="Variants">
          <NuxtLink to="/variants">
            <pie-chart-outlined/>
            <span>Variants</span>
          </NuxtLink>
        </a-menu-item>
        <a-menu-item key="Attributes">
          <NuxtLink to="/attributes">
            <pie-chart-outlined/>
            <span>Attributes</span>
          </NuxtLink>
        </a-menu-item>
        <a-menu-item key="Warranties">
          <NuxtLink to="/warranties">
            <pie-chart-outlined/>
            <span>Warranties</span>
          </NuxtLink>
        </a-menu-item>

        <a-divider style="border-color: whitesmoke;color: whitesmoke;">Stock</a-divider>
        <a-divider style="border-color: whitesmoke;color: whitesmoke;">Sales</a-divider>
        <a-divider style="border-color: whitesmoke;color: whitesmoke;">Reports</a-divider>
        <a-divider style="border-color: whitesmoke;color: whitesmoke;">People</a-divider>
        <a-sub-menu key="Users">
          <template #title>
            <span>
              <team-outlined/>
              <span>Users</span>
            </span>
          </template>
          <a-menu-item key="Users">
            <NuxtLink to="/users">Users</NuxtLink>
          </a-menu-item>
          <a-menu-item key="Users Roles">Users Roles</a-menu-item>
        </a-sub-menu>
        <a-menu-item key="Customers">
          <NuxtLink to="/customers">
            <contacts-outlined/>
            <span>Customers</span>
          </NuxtLink>
        </a-menu-item>
        <a-menu-item key="Suppliers">
          <NuxtLink to="/suppliers">
            <pie-chart-outlined/>
            <span>Suppliers</span>
          </NuxtLink>
        </a-menu-item>
        <a-menu-item key="Warehouses">
          <NuxtLink to="/warehouses">
            <pie-chart-outlined/>
            <span>Warehouses</span>
          </NuxtLink>
        </a-menu-item>
        <a-menu-item key="Stores">
          <NuxtLink to="/stores">
            <pie-chart-outlined/>
            <span>Stores</span>
          </NuxtLink>
        </a-menu-item>
        <a-sub-menu key="Settings">
          <template #title>
            <span>
              <setting-outlined/>
              <span>Settings</span>
            </span>
          </template>
          <a-menu-item key="setttings1">
            <NuxtLink to="/settings">Barcode Settings</NuxtLink>
          </a-menu-item>
          <a-menu-item key="Users Roles">Users Roles</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <!-- Main Layout -->
    <a-layout theme="dark" style="min-height: 100vh; background-image: linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);">
      <a-layout-content :style="{padding: '5px'}">
        <page-header :style="{ background: '#fff', padding: '20px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'}"/>
        <div >
          <slot :style="{ background: '#fff', padding: '20px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'}" />
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center;  padding: 10px 0;">
        Smart inventory ©2024 Intellitech LTD
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import {ref} from 'vue';
import PageHeader from "~/components/layout/pageHeader.vue";

const onCollapse = (collapsed, type) => {
  console.log(collapsed, type);
};
const onBreakpoint = broken => {
  console.log(broken);
};
const selectedKeys = ref(['4']);
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
