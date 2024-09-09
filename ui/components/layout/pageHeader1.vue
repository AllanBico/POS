<template>
  <a-page-header >
    <div class="header-content">
      <!-- Left Section: Title and Breadcrumb -->
      <div class="header-left">
        <h2>{{capitalizedPath}}</h2>
<!--        <a-breadcrumb class="header-breadcrumb">-->
<!--          <a-breadcrumb-item>Home</a-breadcrumb-item>-->
<!--          <a-breadcrumb-item>{{ breadcrumb }}</a-breadcrumb-item>-->
<!--        </a-breadcrumb>-->
      </div>

      <!-- Right Section: Search and Avatar -->
      <div class="header-right">
        <a-button type="text" @click="toggleSearch">
          <SearchOutlined />
        </a-button>
        <a-input-search
            v-if="showSearch"
            placeholder="Search..."
            enter-button
            @blur="toggleSearch"
            class="header-search-input"
        />
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item key="settings">Settings</a-menu-item>
              <a-menu-item key="logout">Logout</a-menu-item>
            </a-menu>
          </template>
          <a-avatar class="header-avatar" icon="user" />
        </a-dropdown>
      </div>
    </div>
  </a-page-header>
</template>

<script setup>
import { ref } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
const route = useRoute()
const title = ref('Dashboard');
const breadcrumb = ref('Overview');
const showSearch = ref(false);

const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};
const capitalizedPath = ref('');

watchEffect(() => {
  capitalizedPath.value = route.path.replace('/', '').charAt(0).toUpperCase() + route.path.replace('/', '').slice(1);
});
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-title {
  margin: 0;
}

.header-breadcrumb {
  margin-top: 4px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-search-input {
  margin-left: 8px;
}

.header-avatar {
  margin-left: 16px;
}

@media (max-width: 576px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    margin-top: 8px;
  }
}
</style>
