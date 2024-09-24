<template>
  <a-space>
    <!-- Badge and Notification -->
    <a-badge count="4" dot>
      <a-button type="link" :icon="h(BellOutlined)" @click="showNotifications" />
    </a-badge>

    <!-- Search Icon -->
    <a-button type="link" :icon="h(SearchOutlined)" @click="showSearchModal" />

    <!-- Settings Icon -->
    <a-button type="link" :icon="h(SettingOutlined)" />

    <!-- Dropdown with Avatar -->
    <a-dropdown>
      <template #overlay>
        <a-menu>
          <a-menu-item key="settings">Settings</a-menu-item>
          <a-menu-item key="logout">Logout</a-menu-item>
        </a-menu>
      </template>
      <a-avatar class="header-avatar" :icon="h(UserOutlined)" />
    </a-dropdown>
  </a-space>

  <!-- Command Palette Modal -->
  <a-modal
    v-model:visible="isSearchModalVisible"
    :footer="null"
    :closable="false"
    :width="600"
    class="command-palette-modal"
  >
    <!-- Search input -->
    <a-input
      v-model:value="searchTerm"
      placeholder="Search for products, customers, or serials..."
      @input="onSearch"
      class="command-palette-input"

      ref="searchInput"
      :prefix="h(SearchOutlined)"
    />

    <!-- Search results -->
    <div v-if="hasResults" class="command-palette-results">
      <!-- Product results -->
      <div v-if="searchResults.length" class="result-section">
        <h3 class="result-type">Products</h3>
        <a-list item-layout="horizontal" :data-source="searchResults" size="small">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta @click="onProductView(item.productId)">
                :description="`${item.sku} - ${getProductById(item.productId)?.name || 'N/A'}`"
              >
                <template #title>
                  <span>{{ item.sku }} | {{ item?.partNumber }}</span>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>

      <!-- Customer results -->
      <div v-if="CustomerSearchResults.length" class="result-section">
        <h3 class="result-type">Customers</h3>
        <a-list item-layout="horizontal" :data-source="CustomerSearchResults" size="small">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #title>
                  <span>{{ item.name }}</span>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>

      <!-- Serial results -->
      <div v-if="SerialSearchResults.length" class="result-section">
        <h3 class="result-type">Serials</h3>
        <a-list item-layout="horizontal" :data-source="SerialSearchResults" size="small">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta
                :description="`Product: ${item?.variant?.sku || 'N/A'} (${item?.variant?.Product?.name || 'N/A'})`"
              >
                <template #title>
                  <span>{{ item.serialNumber }}</span>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>

    <!-- No results message -->
    <div v-else-if="searchTerm && !hasResults" class="no-results">
      No results found
    </div>

    <!-- Initial state message -->
    <div v-else class="initial-state">
      Start typing to search...
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useProductStore } from '~/stores/product/ProductStore.js';
import { useCustomerStore } from '~/stores/CustomerStore.js';
import { useSerialNumberStore } from '~/stores/SerialNumberStore.js';
import { BellOutlined, SettingOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { notification } from 'ant-design-vue';
import Mousetrap from 'mousetrap';
import {useTabsStore} from "~/stores/tabsStore.js";
import productView from "~/components/product/products/productView.vue";
const tabsStore = useTabsStore();
const serialStore = useSerialNumberStore();
const productVariantStore = useProductStore();
const customerStore = useCustomerStore();
const isSearchModalVisible = ref(false);
const searchTerm = ref('');
const searchInput = ref(null);
const searchResults = ref([]);
const CustomerSearchResults = ref([]);
const SerialSearchResults = ref([]);

// Open search modal
const showSearchModal = () => {
  isSearchModalVisible.value = true;
  nextTick(() => {
    searchInput.value.focus();
  });
};

// Perform search when input changes
const onSearch = async () => {
  if (searchTerm.value.trim() !== '') {
    searchResults.value = await productVariantStore.search(searchTerm.value);
    CustomerSearchResults.value = await customerStore.search(searchTerm.value);
    SerialSearchResults.value = await serialStore.search(searchTerm.value);
  } else {
    searchResults.value = [];
    CustomerSearchResults.value = [];
    SerialSearchResults.value = [];
  }
};

// Computed property to check if there are any results
const hasResults = computed(() => {
  return searchResults.value.length > 0 || 
         CustomerSearchResults.value.length > 0 || 
         SerialSearchResults.value.length > 0;
});

// Helper function to get product by ID from store
const getProductById = (id) => {
  return productVariantStore.productById(id);
};

// Fetch products and variants when component is mounted
onMounted(async () => {
  await productVariantStore.fetchVariants();
  await productVariantStore.fetchProducts();
});

// Bind keyboard shortcut for opening search modal
onMounted(() => {
  Mousetrap.bind('ctrl+q', (event) => {
    event.preventDefault();
    showSearchModal();
  });
});

// Unbind keyboard shortcut when component is unmounted
onBeforeUnmount(() => {
  Mousetrap.unbind('ctrl+q');
});

// Show notifications when Bell icon is clicked
const showNotifications = () => {
  notification.open({
    message: 'Notifications',
    description: 'You have 4 new notifications.',
    onClick: () => {
      console.log('Notification Clicked!');
    },
  });
};

const onProductView = (id) => {
  tabsStore.addTab('Product', productView, { id });
  isSearchModalVisible.value = false;
};
</script>

<style scoped>
.command-palette-modal {
  top: 50px;
}

.command-palette-input {
  margin-bottom: 10px;
}

.command-palette-results {
  max-height: 400px;
  overflow-y: auto;
}

.result-section {
  margin-bottom: 10px;
}

.result-type {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #1890ff;
}

.no-results, .initial-state {
  text-align: center;
  color: #999;
  font-style: italic;
}

:deep(.ant-list-item) {
  padding: 8px 0;
}

:deep(.ant-list-item-meta-title) {
  margin-bottom: 0;
}

:deep(.ant-list-item-meta-description) {
  font-size: 12px;
}
</style>
