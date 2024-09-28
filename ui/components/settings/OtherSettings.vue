<template>
  <div class="other-settings">
    <h3>Other Settings</h3>
    <a-form @submit.prevent="saveOtherSettings">
      <a-form-item label="Date Format">
        <a-select v-model:value="form.dateFormat" placeholder="Select date format">
          <a-select-option value="DD/MM/YYYY">DD/MM/YYYY</a-select-option>
          <a-select-option value="MM/DD/YYYY">MM/DD/YYYY</a-select-option>
          <a-select-option value="YYYY-MM-DD">YYYY-MM-DD</a-select-option>
          <a-select-option value="YYYY/MM/DD">YYYY/MM/DD</a-select-option>
          <a-select-option value="DD-MM-YYYY">DD-MM-YYYY</a-select-option>
          <a-select-option value="MM-DD-YYYY">MM-DD-YYYY</a-select-option>
          <a-select-option value="YYYY.MM.DD">YYYY.MM.DD</a-select-option>
          <a-select-option value="DD.MM.YYYY">DD.MM.YYYY</a-select-option>
          <a-select-option value="MM.DD.YYYY">MM.DD.YYYY</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" @click="saveOtherSettings">Save Changes</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {useSettingsStore} from '@/stores/settingsStore';

const settingsStore = useSettingsStore();
const form = ref({
  dateFormat: '',
});

onMounted(async () => {
  form.value.dateFormat = settingsStore.getSettingByKey('default_date_format');
});

const saveOtherSettings = () => {
  const updates = new Map();
  updates.set('default_date_format', form.value.dateFormat);

  settingsStore.updateSettings(updates);
};
</script>

<style scoped>
.other-settings {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
</style>
