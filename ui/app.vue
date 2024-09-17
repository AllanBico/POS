<template>
  <Toaster richColors   position="top-right" />
  <a-config-provider :theme="theme">
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  </a-config-provider>
</template>
<script setup lang="ts">
import {Toaster} from "vue-sonner";
definePageMeta({
  middleware: 'auth',
});
const theme = reactive({
  token: {
    // Primary Colors
    colorPrimary: "#ff4d4f", // Soft red for primary actions
    colorSecondary: "#141414", // Darker tone for secondary actions
    colorSuccess: "#28a745", // Green for success messages
    colorWarning: "#ff9800", // Bright orange for warnings
    colorError: "#f44336", // Softer red for error states
    colorBackground: "#fafafa", // Bright background for a flat look
    colorText: "#4a4a4a", // Softer grey for better readability

    // Typography
    fontSize: 14, // Default font size for body text
    fontSizeHeading1: 22, // Reduced size for H1 headings
    fontSizeHeading2: 18, // Smaller H2
    fontSizeHeading3: 16, // Compact H3
    lineHeight: 1.5, // Compact line height for a more balanced layout
    fontWeightNormal: 400, // Regular weight for text
    fontWeightBold: 600, // Bold weight for headings

    // Borders
    borderRadius: 4, // Slightly rounded for a modern look
    borderColor: "#e0e0e0", // Light border color for subtle definition
    borderWidth: "1px", // Thinner borders for a minimal style

    // Buttons
    controlHeight: 28, // Compact button height
    controlPaddingHorizontal: 8, // Tighter padding for compact buttons
    controlPaddingVertical: 4, // Reduce vertical padding to keep things compact
    buttonTextTransform: "uppercase", // Stylish uppercase text for buttons
    buttonFontWeight: "bold", // Bold text for emphasis in buttons
    buttonBorderRadius: "3px", // Smooth cornered buttons for a modern feel

    // Inputs
    inputBorderColor: "#d9d9d9", // Softer border for inputs
    inputBorderRadius: "4px", // Smooth border for inputs
    inputPadding: "6px 8px", // Compact padding for input fields
    inputFocusBorderColor: "#ff4d4f", // Primary red on focus for inputs

    // Shadows and Spacing
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.05)", // Subtle shadow for a modern flat effect
    padding: 6, // Compact padding for containers

    // Table
    tableHeaderBackground: "#f0f0f0", // Light background for table headers
    tableRowBackgroundHover: "#fafafa", // Slight hover effect on rows
    tableBorderColor: "#d9d9d9", // Subtle borders around table cells
    tablePadding: "8px 12px", // Compact padding for table cells

    // Modals
    modalBackground: "#ffffff", // Clean white for modal background
    modalPadding: "16px", // Adequate padding inside modal
    modalBorderRadius: "6px", // Smooth corners for modals
    modalHeaderBorderBottom: "1px solid #e0e0e0", // Light border for modal header
    modalShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)", // Stronger shadow for modal depth

    // Dropdowns
    dropdownBackground: "#ffffff", // Clean background for dropdowns
    dropdownBorder: "1px solid #e0e0e0", // Light border around dropdowns
    dropdownPadding: "8px", // Compact padding inside dropdowns

    // Cards
    cardPadding: "12px", // Adequate padding inside cards
    cardShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)", // Light shadow for depth
    cardBorderRadius: "4px", // Rounded corners for cards
    cardBorderColor: "#f0f0f0", // Subtle border color for a polished look

    // Tags
    tagBorderRadius: "16px", // Pill-shaped tags for a modern look
    tagFontSize: "12px", // Smaller font size for tags
    tagPadding: "4px 12px", // Compact padding for tags

    // Tabs
    tabBarBackground: "#ffffff", // Clean white for tab bar background
    tabBarBorderColor: "#e0e0e0", // Light border under the tab bar
    tabPadding: "8px 16px", // Compact padding for tab labels
    tabFontSize: "14px", // Smaller font for tabs

    // Other
    wireframe: false, // Maintain the polished look, disable wireframe
  }
});

</script>
<style>
html {
  padding: 0;
  margin: 0;
  font-size: 0.6rem;
}

</style>