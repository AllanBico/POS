<template>
  <div class="settings-page">
    <a-row>
      <!-- Sidebar Menu for Settings Categories -->
      <a-col :span="6">
        <a-menu mode="inline" default-selected-keys="['company']">
          <a-menu-item key="company" @click="changeCategory('company')">Company Information</a-menu-item>
          <a-menu-item key="tax" @click="changeCategory('tax')">Tax Settings</a-menu-item>
          <a-menu-item key="currency" @click="changeCategory('currency')">Currency Settings</a-menu-item>
          <a-menu-item key="others" @click="changeCategory('others')">Other Settings</a-menu-item>
        </a-menu>
      </a-col>

      <!-- Settings Form based on selected category -->
      <a-col :span="18">
        <component :is="currentCategoryComponent" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {useSettingsStore} from '@/stores/settingsStore';

const settingsStore = useSettingsStore();
settingsStore.fetchSettings()
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
  padding: 20px;
}

a-form-item {
  margin-bottom: 16px;
}
</style>
