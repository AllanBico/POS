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
    colorPrimary: "#ed5542", // Red color for the primary UI elements like buttons, icons, etc.
    colorSecondary: "#14122e", // Dark color for text and secondary actions
    colorSuccess: "#28a745", // Standard green for success states
    colorWarning: "#ff9800", // Orange for warnings
    colorError: "#e9ada4", // Soft pink for errors
    colorBackground: "#ed5542", // Red background for the entire layout
    colorText: "#14122e", // Dark text color for readability on white elements

    // --- Background & Element Styling ---
    // Global Background
    layoutBodyBackground: "#ed5542", // Full-page background color (red)
    bodyBackgroundColor: "#ed5542", // Red background across the entire application

    // Element Backgrounds (White)
    cardBackground: "#ffffff", // White background for cards
    modalBackground: "#ffffff", // White background for modals
    inputBackground: "#ffffff", // White background for form inputs
    buttonBackground: "#ffffff", // White background for buttons

    // Typography
    colorTextHeading: "#14122e", // Dark text for headings on white elements
    colorTextBody: "#14122e", // Dark text for body content
    fontSizeBase: 14, // Base font size
    fontSizeHeading1: 24, // Slightly larger H1 font size
    fontSizeHeading2: 20, // H2 font size
    fontSizeHeading3: 16, // H3 font size

    // --- Borders ---
    borderColor: "#e9ada4", // Light pinkish border color for inputs, buttons, cards, etc.
    borderRadiusBase: "6px", // Default border radius for smoother corners
    borderWidth: "1px", // Consistent 1px border

    // --- Buttons ---
    buttonPrimaryColor: "#ffffff", // White background for primary buttons
    buttonTextColorPrimary: "#ed5542", // Red text on primary buttons (inverse)
    buttonBorderRadius: "6px", // Rounded button corners
    buttonPaddingHorizontal: "12px", // Padding for buttons
    buttonPaddingVertical: "8px", // Vertical padding
    buttonFontWeight: "bold", // Bold text for buttons
    buttonHoverBackground: "#e9ada4", // Hover effect on buttons with the soft pink color

    // --- Inputs ---
    inputBorderColor: "#e9ada4", // Soft pink borders for inputs
    inputBorderRadius: "6px", // Rounded input corners for consistency
    inputPadding: "8px 12px", // Padding inside inputs for better spacing
    inputTextColor: "#14122e", // Dark text inside inputs for readability
    inputFocusBorderColor: "#ed5542", // Focus border color matching primary red

    // --- Cards ---
    cardPadding: "16px", // Padding inside cards
    cardShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)", // Subtle shadow for depth
    cardBorderRadius: "6px", // Rounded card corners
    cardBorderColor: "#e9ada4", // Border color for cards matching the pink tone
    cardHeaderBackgroundColor: "#ffffff", // White background for card headers
    cardContentBackgroundColor: "#ffffff", // White content background
    cardTextColor: "#14122e", // Dark text on cards

    // --- Modals ---
    modalPadding: "20px", // Internal modal padding
    modalBorderRadius: "8px", // Smooth corners for modals
    modalBorderColor: "#e9ada4", // Soft border for modals
    modalShadow: "0px 6px 16px rgba(0, 0, 0, 0.1)", // Stronger shadow for modal depth

    // --- Table ---
    tableHeaderBackground: "#f0f0f0", // Light grey background for table headers
    tableRowBackgroundHover: "#fafafa", // Light hover effect on table rows
    tableBorderColor: "#e9ada4", // Border color for tables
    tablePadding: "10px", // Padding for table cells

    // --- Tabs ---
    tabBarBackground: "#ffffff", // White background for tabs
    tabBarBorderColor: "#e9ada4", // Border under tab bar
    tabPadding: "10px 16px", // Tab padding
    tabFontSize: "14px", // Font size for tabs

    // --- Dropdowns ---
    dropdownBackground: "#ffffff", // White background for dropdowns
    dropdownBorder: "1px solid #e9ada4", // Soft pink border for dropdowns
    dropdownPadding: "8px", // Dropdown padding

    // --- Shadows and Spacing ---
    boxShadowBase: "0px 2px 8px rgba(0, 0, 0, 0.05)", // Default box shadow
    paddingBase: 8, // Standard padding across UI

    // --- Other ---
    wireframe: false, // Keep the polished look
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