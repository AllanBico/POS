<template>
  <Toaster richColors position="top-right" />
  <a-config-provider :theme="theme">
    <div v-if="loading" class="loading-svg">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 75" width="150" height="75">
        <path fill="none" stroke="#FF0000" stroke-width="10" stroke-linecap="round" stroke-dasharray="150 192.5" stroke-dashoffset="0" d="M137.5 37.5c0 15.5-13.5 25-25 25-29 0-46-50-75-50-14 0-25 11-25 25s11.5 25 25 25c29 0 46-50 75-50 12 0 25 9.5 25 25Z">
          <animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="342.5;-342.5" keySplines="0 0 1 1" repeatCount="indefinite"></animate>
        </path>
      </svg>
    </div>
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </a-config-provider>
</template>

<script setup>
import { Toaster } from "vue-sonner";
import { reactive, onMounted, ref } from 'vue';
import { useCategoryStore } from '~/stores/product/CategoryStore.js';
import { useAuthStore } from "~/stores/AuthStore.js";
import {useSettingsStore} from "~/stores/settingsStore.js";
import { useAttributesStore } from "~/stores/product/AttributeStore.js";
import { useUnitStore } from '~/stores/product/UnitStore.js';
import { useBrandStore } from "~/stores/product/BrandStore.js";
definePageMeta({ middleware: 'auth' });
const router = useRouter();

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
    modalBackgroundColor: "#b792e7",
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

const loading = ref(true); // Add loading state


const loadData = () => {
  loading.value = true; 
  const authStore = useAuthStore();
  const categoryStore = useCategoryStore();
  const settingsStore = useSettingsStore();
  const attributesStore = useAttributesStore(); 
  const brandStore = useBrandStore();
  const unitStore = useUnitStore();
  return Promise.all([
    authStore.fetchPermissions(), 
    settingsStore.fetchSettings(),
    categoryStore.fetchCategories(), 
    attributesStore.fetchAttributes(),
    unitStore.fetchUnits(),
    brandStore.fetchBrands(),
  ])
    .then(() => {
      console.log('Data loaded successfully');
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    })
    .finally(() => {
      loading.value = false; // Set loading to false after fetching
    });
};

router.beforeResolve(async (to, from, next) => {
  const authStore = useAuthStore();
  const categoryStore = useCategoryStore();

  const isAuthenticated = authStore.isAuthenticated;

  if (isAuthenticated && categoryStore.categories.length === 0) {
    // If the user is authenticated and categories are not fetched, fetch them
    await loadData(); // Call loadData to fetch categories
  }

  next();
});

onMounted(() => {
  loadData(); // Call loadData when the component is mounted
});
</script>

<style scoped>
/* html, body { margin: 0; padding: 0; } */
body { font-size: 0.3rem; }
.loading-svg {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full height for centering */
}
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