<template>
  <div class="company-settings">
    <h3>Company Information</h3>
    <a-form @submit.prevent="saveCompanySettings">
      <a-form-item label="Company Name">
        <a-input v-model:value="form.companyName"/>
      </a-form-item>
      <a-form-item label="Email">
        <a-input v-model:value="form.companyEmail"/>
      </a-form-item>
      <a-form-item label="Phone Number">
        <a-input v-model:value="form.companyPhone"/>
      </a-form-item>
      <a-form-item label="Company Logo">
        <a-upload :before-upload="beforeUploadLogo" :file-list="fileList.logo">
          <a-button>Upload Photo</a-button>
        </a-upload>
      </a-form-item>
      <a-form-item label="Company Icon">
        <a-upload :before-upload="beforeUploadIcon" :file-list="fileList.icon">
          <a-button>Upload Icon</a-button>
        </a-upload>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="saveCompanySettings">Save Changes</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useSettingsStore} from '@/stores/settingsStore';

const settingsStore = useSettingsStore();
const form = ref({
  companyName: settingsStore?.getSettingByKey('company_name'),
  companyEmail: settingsStore.settings.companyEmail || '',
  companyPhone: settingsStore.settings.companyPhone || '',
});

const fileList = ref({
  logo: [],
  icon: [],
});

const beforeUploadLogo = (file) => {
  fileList.value.logo = [file];
  return false;
};

const beforeUploadIcon = (file) => {
  fileList.value.icon = [file];
  return false;
};

const saveCompanySettings = () => {
  const updates = {
    companyName: form.value.companyName,
    companyEmail: form.value.companyEmail,
    companyPhone: form.value.companyPhone,
    companyLogo: fileList.value.logo.length ? fileList.value.logo[0] : null,
    companyIcon: fileList.value.icon.length ? fileList.value.icon[0] : null,
  };
  settingsStore.updateSetting(updates);
};
</script>

<style scoped>
.company-settings {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
</style>
