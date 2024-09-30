<template>
  <Toaster richColors position="top-right" />
  <a-config-provider :theme="theme">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </a-config-provider>
</template>

<script setup>
import { Toaster } from "vue-sonner";
import { reactive } from 'vue';

definePageMeta({ middleware: 'auth' });

const theme = reactive({
  token: {
    colorPrimary: "#f2003c",
    colorSecondary: "#14122e",
    colorSuccess: "#30cf58",
    colorWarning: "#ff9800",
    colorError: "#d12eb6",
    colorBackground: "#2fd04f",
    colorText: "#14122e",
    layoutBodyBackground: "#2fd04f",
    bodyBackgroundColor: "#2fd04f",
    cardBackground: "#b792e7",
    modalBackground: "#b792e7",
    inputBackground: "#b792e7",
    buttonBackground: "#ffffff",
    colorTextHeading: "#14122e",
    colorTextBody: "#14122e",
    fontSizeBase: 8,
    fontSizeHeading1: 12,
    fontSizeHeading2: 10,
    fontSizeHeading3: 9,
    borderRadiusBase: "2px",
    borderWidth: "1px",
    buttonPrimaryColor: "#ffffff",
    buttonTextColorPrimary: "#2fd04f",
    buttonBorderRadius: "2px",
    buttonPaddingHorizontal: "6px",
    buttonPaddingVertical: "3px",
    buttonFontWeight: "bold",
    buttonHoverBackground: "#d12eb6",
    inputBorderColor: "#d12eb6",
    inputBorderRadius: "2px",
    inputPadding: "3px 6px",
    inputTextColor: "#14122e",
    inputFocusBorderColor: "#2fd04f",
    cardPadding: "8px",
    cardShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
    cardBorderRadius: "2px",
    cardBorderColor: "#d12eb6",
    cardHeaderBackgroundColor: "#f1fcf4",
    cardContentBackgroundColor: "#f1fcf4",
    cardTextColor: "#14122e",
    modalPadding: "10px",
    modalBorderRadius: "3px",
    modalBorderColor: "#d12eb6",
    modalShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    modalBackgroundColor:"#b792e7",
    tableHeaderBackground: "#f0f0f0",
    tableRowBackgroundHover: "#fafafa",
    tableBorderColor: "#d12eb6",
    tablePadding: "4px",
    tabBarBackground: "#ffffff",
    tabBarBorderColor: "#d12eb6",
    tabPadding: "4px 8px",
    tabFontSize: "8px",
    dropdownBackground: "#ffffff",
    dropdownBorder: "1px solid #d12eb6",
    dropdownPadding: "3px",
    boxShadowBase: "0px 1px 3px rgba(0, 0, 0, 0.05)",
    paddingBase: 3,
    wireframe: false,
  },
});
</script>

<style scoped>
html, body { margin: 0; padding: 0; }
body { font-size: 0.3rem; }
.div-container { background-color: #f0f2f5; padding: 8px; border-radius: 3px; }
.div-header-card { margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
.div-header { padding: 6px; }
.div-header h1 { font-size: 10px; font-weight: 600; color: #001529; }
.add-brand-btn, .export-btn { font-size: 8px; height: 18px; }
.div-table-container { background-color: #ffffff; padding: 8px; border-radius: 3px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
:deep(.ant-table) { font-size: 8px; }
:deep(.ant-table-thead > tr > th) { background-color: #fafafa; color: #001529; font-weight: 600; }
:deep(.ant-table-tbody > tr > td) { padding: 4px 8px; }
:deep(.ant-table-tbody > tr:hover > td) { background-color: #f5f5f5; }
.custom-filter-dropdown { padding: 3px; border-radius: 2px; background-color: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15); }
.custom-filter-dropdown input { width: 100px; margin-bottom: 3px; }
.custom-filter-dropdown button { width: 50px; margin-right: 3px; }
.actions-btn { background-color: #f0f0f0; border-color: #d9d9d9; }
.actions-btn:hover { background-color: #e6e6e6; }
.edit-link, .delete-link { color: #001529; }
.edit-link:hover, .delete-link:hover { color: #ff4d4f; }
.text-primary { color: #1890ff; }
</style>