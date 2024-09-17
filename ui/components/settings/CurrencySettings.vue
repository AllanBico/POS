<template>
  <div class="currency-settings">
    <h3>Currency Settings</h3>
    <a-form @submit.prevent="saveCurrencySettings">
      <a-form-item label="Default Currency">
        <a-select v-model:value="form.currency">
          <a-select-option value="USD">USD</a-select-option>
          <a-select-option value="EUR">EUR</a-select-option>
          <a-select-option value="GBP">GBP</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="saveCurrencySettings">Save Changes</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useSettingsStore} from '@/stores/settingsStore';

const settingsStore = useSettingsStore();
const form = ref({
  currency: settingsStore.settings.currency || 'USD',
});

const saveCurrencySettings = () => {
  const updates = {
    currency: form.value.currency,
  };
  settingsStore.updateSetting(updates);
};
</script>

<style scoped>
.currency-settings {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
</style>
