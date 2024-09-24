<template>
  <div class="company-settings">
    <h3>Company Information</h3>
    <a-form @submit.prevent="saveCompanySettings">
      <a-form-item label="Company Name">
        <a-input v-model:value="form.companyName" />
      </a-form-item>
      <a-form-item label="Email">
        <a-input v-model:value="form.companyEmail" />
      </a-form-item>
      <a-form-item label="Phone Number">
        <a-input v-model:value="form.companyPhone" />
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
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';

const settingsStore = useSettingsStore();

const form = ref({
  companyName: '',
  companyEmail: '',
  companyPhone: '',
});

const fileList = ref({
  logo: [],
  icon: [],
});

// Fetch settings on page load
onMounted(async () => {
  await settingsStore.fetchSettings();

  form.value.companyName = settingsStore.getSettingByKey('company_name');
  form.value.companyEmail = settingsStore.getSettingByKey('company_email');
  form.value.companyPhone = settingsStore.getSettingByKey('company_phone');
});

const beforeUploadLogo = (file) => {
  fileList.value.logo = [file];
  return false; // Prevent auto-upload
};

const beforeUploadIcon = (file) => {
  fileList.value.icon = [file];
  return false; // Prevent auto-upload
};

const saveCompanySettings = async () => {
  let companyLogoUrl = null;
  let companyIconUrl = null;

  // Upload logo if there is a new file
  if (fileList.value.logo.length) {
    const uploadResponse = await settingsStore.uploadFile(fileList.value.logo[0]);
    if (uploadResponse) {
      companyLogoUrl = uploadResponse.url; // Assuming response contains the file URL
    }
  }

  // Upload icon if there is a new file
  if (fileList.value.icon.length) {
    const uploadResponse = await settingsStore.uploadFile(fileList.value.icon[0]);
    if (uploadResponse) {
      companyIconUrl = uploadResponse.url; // Assuming response contains the file URL
    }
  }

  // Prepare updated settings
  const updates = {
    company_name: form.value.companyName,
    company_email: form.value.companyEmail,
    company_phone: form.value.companyPhone,
    company_logo: companyLogoUrl,
    company_icon: companyIconUrl,
  };

  // Update settings in the store
  await settingsStore.updateSetting(updates);
};
</script>

<style scoped>
.company-settings {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
</style>
