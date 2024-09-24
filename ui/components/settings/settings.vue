<template>
  <div class="settings-page">
    <a-row gutter="24">
      <!-- Sidebar Menu for Settings Categories -->
      <a-col :span="6">
        <a-card class="sidebar-card">
          <a-menu mode="inline" default-selected-keys="['company']">
            <a-menu-item key="company" @click="changeCategory('company')">
              <setting-outlined /> Company Information
            </a-menu-item>
            <a-menu-item key="tax" @click="changeCategory('tax')">
              <dollar-outlined /> Tax Settings
            </a-menu-item>
            <a-menu-item key="currency" @click="changeCategory('currency')">
              <global-outlined /> Currency Settings
            </a-menu-item>
            <a-menu-item key="others" @click="changeCategory('others')">
              <ellipsis-outlined /> Other Settings
            </a-menu-item>
          </a-menu>
        </a-card>
      </a-col>

      <!-- Settings Form based on selected category -->
      <a-col :span="18">
        <a-card class="settings-card">
          <component :is="currentCategoryComponent" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { SettingOutlined, DollarOutlined, GlobalOutlined, EllipsisOutlined } from '@ant-design/icons-vue';

const settingsStore = useSettingsStore();
settingsStore.fetchSettings();
console.log("settingsStore.settings",settingsStore.settings);
// Import modularized components
import CompanySettings from '@/components/settings/CompanySettings.vue';
import TaxSettings from '@/components/settings/TaxSettings.vue';
import CurrencySettings from '@/components/settings/CurrencySettings.vue';
import OtherSettings from '@/components/settings/OtherSettings.vue';

const currentCategory = ref('company');

// Dynamically map the current category to the appropriate component
const categoryComponents = {
  company: CompanySettings,
  tax: TaxSettings,
  currency: CurrencySettings,
  others: OtherSettings,
};

const currentCategoryComponent = ref(categoryComponents[currentCategory.value]);

const changeCategory = (category) => {
  currentCategory.value = category;
  currentCategoryComponent.value = categoryComponents[category];
};
</script>

<style scoped>
.settings-page {
  padding: 40px;
  background-color: #f0f2f5;
}

.sidebar-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  background-color: #ffffff;
}

a-menu-item {
  display: flex;
  align-items: center;
  font-size: 16px;
}

a-menu-item .anticon {
  margin-right: 8px;
}

a-form-item {
  margin-bottom: 16px;
}
</style>
