<template>
  <div class="tax-settings">
    <h3>Tax Settings</h3>
    <a-form @submit.prevent="saveTaxSettings">
      <a-form-item label="Default Tax Rate">
        <a-input-number v-model:value="form.taxRate" :min="0" :max="100"/>
      </a-form-item>
      <a-form-item label="Tax Inclusive">
        <a-switch v-model:value="form.taxInclusive"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="saveTaxSettings">Save Changes</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useSettingsStore} from '@/stores/settingsStore';

const settingsStore = useSettingsStore();
const form = ref({
  taxRate: settingsStore.getSettingByKey('default_tax_rate')?.rate,
  taxInclusive: settingsStore.settings.taxInclusive || false,
});

const saveTaxSettings = () => {
  const updates = {
    taxRate: form.value.taxRate,
    taxInclusive: form.value.taxInclusive,
  };
  settingsStore.updateSetting(updates);
};
</script>

<style scoped>
.tax-settings {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
</style>
