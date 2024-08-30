<template>
  <a-layout style="min-height: 100vh">
    <!-- Sidebar -->
    <a-layout-sider
        breakpoint="lg"
        collapsed-width="0"
        @collapse="onCollapse"
        @breakpoint="onBreakpoint"
    >
      <div class="logo" />
      <a-menu
          mode="inline"
          theme="dark"
          v-model:selectedKeys="selectedKeys"
          :defaultOpenKeys="['sub1', 'sub2', 'sub3']"
      >
        <!-- Main Section -->
        <a-menu-item-group key="main" title="Main">
          <a-sub-menu key="sub1" title="Dashboard" >
            <a-menu-item key="1">Admin Dashboard</a-menu-item>
            <a-menu-item key="2">Sales Dashboard</a-menu-item>
          </a-sub-menu>
          <a-menu-item key="3" >Application</a-menu-item>
        </a-menu-item-group>

        <a-divider />

        <!-- Inventory Section -->
        <a-menu-item-group key="inventory" title="Inventory">
          <a-menu-item key="4" >Products</a-menu-item>
          <a-menu-item key="5" ><nuxt-link to="/categories">Categories</nuxt-link></a-menu-item>
          <a-menu-item key="88" ><nuxt-link to="/subcategories">Sub Categories</nuxt-link></a-menu-item>
          <a-menu-item key="6" >Expired Products</a-menu-item>
          <a-menu-item key="7" >Low Stocks</a-menu-item>
        </a-menu-item-group>
        <a-divider />

        <!-- Stock Section -->
        <a-menu-item-group key="people" title="People">
          <a-menu-item key="16" ><nuxt-link to="/users">Users</nuxt-link></a-menu-item>
          <a-menu-item key="17" >Stock Adjustment</a-menu-item>
        </a-menu-item-group>
      </a-menu>
    </a-layout-sider>

    <!-- Main Layout -->
    <a-layout>
      <!-- Header -->
      <a-layout-header class="header">
        <div class="logo" />
        <a-menu
            v-model:selectedKeys="selectedKeys"
            theme="dark"
            mode="horizontal"
            :style="{ lineHeight: '64px' }"
        >
          <a-menu-item key="1">nav 1</a-menu-item>
          <a-menu-item key="2">nav 2</a-menu-item>
          <a-menu-item key="3">nav 3</a-menu-item>
        </a-menu>

        <a-avatar style="background-color: #87d068" class="avatar">
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </a-layout-header>

      <!-- Content -->
      <a-layout-content :style="{ margin: '1px 1px 0', padding: '1px', flex: '1 0 auto' }">
        <slot />
      </a-layout-content>

      <!-- Footer -->
      <a-layout-footer style="text-align: center; flex-shrink: 0;">
        POS ©2024 Created by <a href="https://www.intellitech.co.ke" target="_blank">Intellitech LTD</a>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue';

const selectedKeys1 = ref(['2']);
const onCollapse = (collapsed, type) => {
  console.log(collapsed, type);
};
const onBreakpoint = (broken) => {
  console.log(broken);
};
const selectedKeys = ref(['4']);
</script>

<style scoped>
.logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}

.header {
  background: #001529;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

a-layout-sider {
  height: 100vh;
}

.site-layout-background {
  background: #fff;
}

[data-theme='dark'] .site-layout-sub-header-background {
  background: #141414;
}
.avatar {
  margin-left: auto; /* Pushes the avatar to the right */
}
</style>
