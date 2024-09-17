<template>
  <div class="other-settings">
    <h3>Other Settings</h3>
    <a-form @submit.prevent="saveOtherSettings">
      <a-form-item label="Some Other Setting">
        <a-input v-model:value="form.otherSetting"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="saveOtherSettings">Save Changes</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useSettingsStore} from '@/stores/settingsStore';

const settingsStore = useSettingsStore();
const form = ref({
  otherSetting: settingsStore.settings.otherSetting || '',
});

const saveOtherSettings = () => {
  const updates = {
    otherSetting: form.value.otherSetting,
  };
  settingsStore.updateSetting(updates);
};
</script>

<style scoped>
.other-settings {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
</style>
