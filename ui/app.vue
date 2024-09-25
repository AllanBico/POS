<template>
  <Toaster richColors   position="top-right" />
  <a-config-provider :theme="theme">
  <NuxtLayout>

    <NuxtPage />

  </NuxtLayout>
  </a-config-provider>
</template>
<script setup>
import {Toaster} from "vue-sonner";
definePageMeta({
  middleware: 'auth',
});

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
    fontSizeBase: 14,
    fontSizeHeading1: 24,
    fontSizeHeading2: 20,
    fontSizeHeading3: 16,

    borderRadiusBase: "6px",
    borderWidth: "1px",

    buttonPrimaryColor: "#ffffff",
    buttonTextColorPrimary: "#2fd04f",
    buttonBorderRadius: "6px",
    buttonPaddingHorizontal: "12px",
    buttonPaddingVertical: "8px",
    buttonFontWeight: "bold",
    buttonHoverBackground: "#d12eb6",

    inputBorderColor: "#d12eb6",
    inputBorderRadius: "6px",
    inputPadding: "8px 12px",
    inputTextColor: "#14122e",
    inputFocusBorderColor: "#2fd04f",

    cardPadding: "16px",
    cardShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
    cardBorderRadius: "6px",
    cardBorderColor: "#d12eb6",
    cardHeaderBackgroundColor: "#f1fcf4",
    cardContentBackgroundColor: "#f1fcf4",
    cardTextColor: "#14122e",

    modalPadding: "20px",
    modalBorderRadius: "8px",
    modalBorderColor: "#d12eb6",
    modalShadow: "0px 6px 16px rgba(0, 0, 0, 0.1)",
    modalBackgroundColor:"#b792e7",

    tableHeaderBackground: "#f0f0f0",
    tableRowBackgroundHover: "#fafafa",
    tableBorderColor: "#d12eb6",
    tablePadding: "10px",

    tabBarBackground: "#ffffff",
    tabBarBorderColor: "#d12eb6",
    tabPadding: "10px 16px",
    tabFontSize: "14px",

    dropdownBackground: "#ffffff",
    dropdownBorder: "1px solid #d12eb6",
    dropdownPadding: "8px",

    boxShadowBase: "0px 2px 8px rgba(0, 0, 0, 0.05)",
    paddingBase: 8,

    wireframe: false,
  },
  // components: {
  //   Card: {
  //     colorBgContainer: "#faf7fe",
  //   },
  //   Modal: {
  //     colorBgElevated: "#faf7fe",
  //   },
  //   Menu: {
  //     colorItemBg: "#f2eff6",
  //   }
  // }
});


</script>
<style>
html {
  padding: 0;
  margin: 0;
  font-size: 0.6rem;
}
.div-container {
  background-color: #f0f2f5;
  padding: 24px;
  border-radius: 8px;
}

.div-header-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.div-header {
  padding: 16px;
}

.div-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
}

.add-brand-btn {
  font-size: 14px;
  height: 36px;
  margin-right: 8px;
}

.export-btn {
  height: 36px;
}

.div-table-container {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

:deep(.ant-table) {
  font-size: 14px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  color: #001529;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}

.custom-filter-dropdown {
  padding: 8px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.custom-filter-dropdown input {
  width: 200px;
  margin-bottom: 8px;
  display: block;
}

.custom-filter-dropdown button {
  width: 100px;
  margin-right: 8px;
}

.actions-btn {
  background-color: #f0f0f0;
  border-color: #d9d9d9;
}

.actions-btn:hover {
  background-color: #e6e6e6;
  border-color: #d9d9d9;
}

.edit-link, .delete-link {
  color: #001529;
}

.edit-link:hover, .delete-link:hover {
  color: #ff4d4f;
}

.text-primary {
  color: #1890ff;
}
</style>