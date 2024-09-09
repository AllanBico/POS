<template>
  <a-layout-header class="header">
    <div class="breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item>Pages</a-breadcrumb-item>
        <a-breadcrumb-item>Dashboard</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

<!--    <div class="page-title">-->
<!--      <h1>Dashboard</h1>-->
<!--    </div>-->

    <div class="header-right">
      <a-input-search placeholder="Type here..." class="search-input" />

      <a-space size="middle">
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
      </a-space>
    </div>
  </a-layout-header>
</template>

<script setup>
import { BellOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons-vue';

</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.breadcrumb {
  flex-grow: 1;
}

.page-title {
  margin-left: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.search-input {
  margin-right: 20px;
  width: 200px;
}

.sign-in {
  font-weight: bold;
}

a-button {
  color: #000;
}

a-badge .a-button {
  padding: 0;
}
</style>
