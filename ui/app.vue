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
    // --- Primary Colors ---
    // colorPrimary: "#2ed162", // Light green from the primary palette for UI elements like buttons, icons
    // colorSecondary: "#14122e", // Dark secondary color for text and secondary actions (unchanged)
    // colorSuccess: "#30cf58", // Adjusted green from the provided color scale
    // colorWarning: "#ff9800", // Keep the orange for warnings
    // colorError: "#d12eb6", // Soft accent pink for errors
    // colorBackground: "#2fd04f", // Light green for background in light mode
    colorText: "#14122e", // Dark text color for readability (unchanged)

    // --- Background & Element Styling ---
    // Global Background
    layoutBodyBackground: "#2fd04f", // Light green background for the entire layout
    bodyBackgroundColor: "#2fd04f", // Consistent green background for body

    // Element Backgrounds (White)
    // cardBackground: "#b792e7", // White background for cards (unchanged)
    // modalBackground: "#b792e7", // White background for modals (unchanged)
    // inputBackground: "#b792e7", // White background for form inputs (unchanged)
    // buttonBackground: "#ffffff", // White button background (unchanged)

    // Typography
    colorTextHeading: "#14122e", // Dark text for headings (unchanged)
    colorTextBody: "#14122e", // Dark text for body content (unchanged)
    fontSizeBase: 14, // Base font size (unchanged)
    fontSizeHeading1: 24, // H1 size (unchanged)
    fontSizeHeading2: 20, // H2 size (unchanged)
    fontSizeHeading3: 16, // H3 size (unchanged)

    // --- Borders ---
    // borderColor: "#d12eb6", // Accent pink for borders (from the accent scale)
    borderRadiusBase: "6px", // Default border radius (unchanged)
    borderWidth: "1px", // Border width (unchanged)

    // --- Buttons ---
    // buttonPrimaryColor: "#ffffff", // White background for buttons (unchanged)
    // buttonTextColorPrimary: "#2fd04f", // Green text on primary buttons
    buttonBorderRadius: "6px", // Rounded button corners (unchanged)
    buttonPaddingHorizontal: "12px", // Padding for buttons (unchanged)
    buttonPaddingVertical: "8px", // Vertical padding (unchanged)
    buttonFontWeight: "bold", // Bold text for buttons (unchanged)
    // buttonHoverBackground: "#d12eb6", // Hover effect in accent pink

    // --- Inputs ---
    // inputBorderColor: "#d12eb6", // Pink borders for inputs
    inputBorderRadius: "6px", // Rounded input corners (unchanged)
    inputPadding: "8px 12px", // Padding for inputs (unchanged)
    inputTextColor: "#14122e", // Dark text inside inputs (unchanged)
    // inputFocusBorderColor: "#2fd04f", // Green border color on focus

    // --- Cards ---
    cardPadding: "16px", // Padding inside cards (unchanged)
    cardShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)", // Shadow for depth (unchanged)
    cardBorderRadius: "6px", // Rounded corners for cards (unchanged)
    // cardBorderColor: "#d12eb6", // Border color in pink
    // cardHeaderBackgroundColor: "#f1fcf4", // White background for card headers (unchanged)
    // cardContentBackgroundColor: "#f1fcf4", // White content background (unchanged)
    cardTextColor: "#14122e", // Dark text on cards (unchanged)

    // --- Modals ---
    modalPadding: "20px", // Modal padding (unchanged)
    modalBorderRadius: "8px", // Rounded corners for modals (unchanged)
    // modalBorderColor: "#d12eb6", // Pink border for modals
    modalShadow: "0px 6px 16px rgba(0, 0, 0, 0.1)", // Stronger shadow for depth
    // modalBackgroundColor:"#b792e7",

    // --- Table ---
    // tableHeaderBackground: "#f0f0f0", // Light grey background for table headers (unchanged)
    // tableRowBackgroundHover: "#fafafa", // Light hover effect on table rows (unchanged)
    // tableBorderColor: "#d12eb6", // Pink border for tables
    tablePadding: "10px", // Padding for table cells (unchanged)

    // --- Tabs ---
    // tabBarBackground: "#ffffff", // White background for tabs (unchanged)
    // tabBarBorderColor: "#d12eb6", // Pink border under tabs
    tabPadding: "10px 16px", // Padding for tabs (unchanged)
    tabFontSize: "14px", // Font size for tabs (unchanged)

    // --- Dropdowns ---
    dropdownBackground: "#ffffff", // White background for dropdowns (unchanged)
    dropdownBorder: "1px solid #d12eb6", // Pink border for dropdowns
    dropdownPadding: "8px", // Padding for dropdowns (unchanged)

    // --- Shadows and Spacing ---
    boxShadowBase: "0px 2px 8px rgba(0, 0, 0, 0.05)", // Default shadow (unchanged)
    paddingBase: 8, // Standard padding (unchanged)

    // --- Other ---
    wireframe: false, // Keep the polished look (unchanged)
  },
  // components: {
  //   Card: {
  //     colorBgContainer: "#f1fcf4", // Light green background for card containers
  //   },
  //   Modal: {
  //     colorBgElevated: "#f1fcf4", // Light green background for elevated modal containers
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