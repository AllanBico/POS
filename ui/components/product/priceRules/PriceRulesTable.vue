<template>
    <div class="div-container">
      <!-- Modals -->
      <a-modal
        v-model:open="isAddModalOpen"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        ok-text="Submit"
        cancel-text="Cancel"
        :maskClosable="false"
      >
        <price-rule-add-modal @submit-success="handleSubmitSuccess" :variantId="props.variantId"></price-rule-add-modal>
        <template #footer> </template>
      </a-modal>
      <a-modal v-model:open="isEditingPriceRule"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        ok-text="Submit"
        cancel-text="Cancel"
        :maskClosable="false" :footer="null">
            <price-rule-edit-modal :priceRuleId="selectedPriceRule" @submit-success="handleSubmitSuccess" />
        </a-modal>
        <a-modal v-model:open="isViewPriceRule"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        ok-text="Submit"
        cancel-text="Cancel"
        width="60%"
        :maskClosable="false" :footer="null">
            <price-rule-details :priceRuleId="selectedPriceRule" @submit-success="handleSubmitSuccess" />
        </a-modal>
      <a-card class="div-header-card" :bordered="false">
        
        <a-page-header
          class="div-header"
          style="padding: 0%;"
          :title="`Price Rules for ${variant.Product.name} ${variant.sku}`"
          sub-title="Manage price rules "
        >
          <template #extra>
            <a-button
              v-if="canCreatePriceRule"
              class="add-price-rule-btn"
              type="primary"
              @click="handleAddPriceRule"
              :icon="h(PlusOutlined)"
            >
              Create Price Rule
            </a-button>
          </template>
        </a-page-header>
      </a-card>
  
      <div class="div-table-container">
        <a-table
          :dataSource="priceRules"
          :columns="columns"
          :rowKey="(record) => record.id"
          :loading="loading"
          size="middle"
          @change="handleTableChange"
          :scroll="{ x: 'max-content' }"
          :rowClassName="(record, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'operation' && (canUpdatePriceRule || canDeletePriceRule)">
              <div class="action-buttons">
                <a-tooltip title="View">
                  <a-button
                    v-if="canUpdatePriceRule"
                    type="link"
                    class="edit-btn"
                    @click="handleViewPriceRule(record.id)"
                    :style="{ color: '#1890ff' }"
                  >
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="Edit">
                  <a-button
                    v-if="canUpdatePriceRule"
                    type="link"
                    class="edit-btn"
                    @click="handleEditPriceRule(record.id)"
                    :style="{ color: '#1890ff' }"
                  >
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-popconfirm
                  v-if="canDeletePriceRule"
                  :title="`Are you sure you want to delete this price rule?`"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="handleDeletePriceRule(record.id)"
                  placement="bottom"
                >
                  <a-tooltip title="Delete">
                    <a-button
                      type="link"
                      class="delete-btn"
                      :style="{ color: '#ff4d4f' }"
                    >
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </a-tooltip>
                </a-popconfirm>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import { useProductStore } from "~/stores/product/ProductStore.js";
  import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
  } from "@ant-design/icons-vue";
  import { useAuthStore } from "~/stores/AuthStore.js";
  import PriceRuleAddModal from "~/components/product/priceRules/priceRuleAddModal.vue";
  import PriceRuleEditModal from "~/components/product/priceRules/priceRuleEditModal.vue";
  import PriceRuleDetails from '~/components/product/priceRules/priceRuleDetails.vue';

  const props = defineProps({
    variantId: {
      type: Number,
      required: true,
    },
  });
  const variant = computed(() => productStore.variantById(parseInt(props.variantId)))
  const authStore = useAuthStore();
  const productStore = useProductStore();
  
  const priceRules = ref([]);
  const loading = ref(false);
  const isAddModalOpen = ref(false);
  const isEditingPriceRule = ref(false);
  const isViewPriceRule = ref(false);
  const selectedPriceRule = ref(null);


  const canCreatePriceRule = computed(() => authStore.hasPermission('price-rule', 'create'));
  const canUpdatePriceRule = computed(() => authStore.hasPermission('price-rule', 'update'));
  const canDeletePriceRule = computed(() => authStore.hasPermission('price-rule', 'delete'));
  
  const columns = [
    {
      title: "Rule Type",
      dataIndex: "ruleType",
      sorter: (a, b) => a.ruleType.localeCompare(b.ruleType),
    },
    {
      title: "Adjustment Type",
      dataIndex: "adjustmentType",
      sorter: (a, b) => a.adjustmentType.localeCompare(b.adjustmentType),
    },
    {
      title: "Adjustment Value",
      dataIndex: "adjustmentValue",
      sorter: (a, b) => a.adjustmentValue - b.adjustmentValue,
    },

    {
      title: "Operation",
      dataIndex: "operation",
      // Only render this column if there are permissions to update or delete
      render: () => (canUpdatePriceRule.value || canDeletePriceRule.value),
    },
  ];
  
  const handleAddPriceRule = () => {
    isAddModalOpen.value = true;
  };
  
  const handleViewPriceRule = (priceRuleId) => {
    console.log("handleViewPriceRule")
    // Implement logic to open a modal or navigate to a page for editing the price rule
    selectedPriceRule.value = priceRuleId
    isViewPriceRule.value = true;
  };
  const handleEditPriceRule = (priceRuleId) => {
    // Implement logic to open a modal or navigate to a page for editing the price rule
    selectedPriceRule.value = priceRuleId
    isEditingPriceRule.value = true;
  };
  
  const handleDeletePriceRule = async (priceRuleId) => {
    try {
      await productStore.deletePriceRule(priceRuleId);
      console.log("Price Rule deleted successfully:", priceRuleId);
    } catch (error) {
      console.error("Error deleting price rule:", error);
      // TODO: Implement user-friendly error handling
    }
  };
  
  const handleTableChange = (pagination, filters, sorter) => {
    console.log("Table changed:", pagination, filters, sorter);
    // TODO: Implement table change logic if needed
  };
  
  const handleModalOk = () => {
    isAddModalOpen.value = false;
    isEditingPriceRule.value = false;
  };
  
  const handleModalCancel = () => {
    isAddModalOpen.value = false;
    isEditingPriceRule.value = false;
  };
  
  const handleSubmitSuccess = () => {
    isAddModalOpen.value = false;
    isEditingPriceRule.value = false;
  };
  
  onMounted(async () => {
    loading.value = true;
    try {
      await productStore.fetchPriceRules(parseInt(props.variantId));
      await productStore.fetchPriceRules(parseInt(props.variantId));
      priceRules.value = productStore.priceRules
    } catch (error) {
      console.error("Error fetching price rules:", error);
      // TODO: Implement user-friendly error handling
    } finally {
      loading.value = false;
    }
  });
  </script>
  
  <style scoped>
  .div-container {
    background-color: #f0f2f5;
    padding: 24px;
    border-radius: 8px;
  }
  
  .div-header-card {
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .div-header {
    padding: 16px;
  }
  
  .div-header h1 {
    font-size: 24px;
    font-weight: 600;
    color: #001529;
  }
  
  .add-price-rule-btn {
    font-size: 14px;
    height: 36px;
    margin-right: 8px;
  }
  
  .div-table-container {
    background-color: #ffffff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  
  .action-buttons {
    display: flex;
    gap: 8px;
  }
  
  .edit-btn,
  .delete-btn {
    color: #001529;
  }
  
  .edit-btn:hover,
  .delete-btn:hover {
    color: #ff4d4f;
  }
  
  .even-row {
    background-color: #f9f9f9;
  }
  
  .odd-row {
    background-color: #ffffff;
  }
  </style>