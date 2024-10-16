<template>
    <div class="price-rule-details">
      <h3 class="title">Price Rule Details</h3>
      <a-divider class="divider" />
      <div v-if="priceRule">
        <a-row :gutter="[16, 16]">
          <a-col :span="24">
            <a-descriptions bordered>
              <a-descriptions-item label="Rule Type">
                {{ priceRule.ruleType }}
              </a-descriptions-item>
              <a-descriptions-item label="Adjustment Type">
                {{ priceRule.adjustmentType }}
              </a-descriptions-item>
              <a-descriptions-item label="Adjustment Value">
                {{ priceRule.adjustmentValue }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]" v-if="priceRule.ruleType === 'time'">
          <a-col :span="24">
            <a-descriptions bordered>
              <a-descriptions-item label="Start Time">
                {{ priceRule.startTime }}
              </a-descriptions-item>
              <a-descriptions-item label="End Time">
                {{ priceRule.endTime }}
              </a-descriptions-item>
              <a-descriptions-item label="Daily Start Time">
                {{ priceRule.dailyStartTime }}
              </a-descriptions-item>
              <a-descriptions-item label="Daily End Time">
                {{ priceRule.dailyEndTime }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]" v-if="priceRule.ruleType === 'bundle'">
          <a-col :span="24">
            <a-descriptions bordered>
              <a-descriptions-item label="Bundle With Variant">
                {{ priceRule?.bundleVariant?.Product?.name }} ({{ priceRule?.bundleVariant?.sku }})
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]" v-if="priceRule.ruleType === 'location'">
          <a-col :span="24">
            <a-descriptions bordered>
              <a-descriptions-item label="Location Type">
                {{ priceRule.locationType }}
              </a-descriptions-item>
              <a-descriptions-item :label="priceRule.locationType === 'warehouse' ? 'Warehouse' : 'Store'">
                {{ priceRule.locationType === 'warehouse' ? priceRule.warehouse.name : priceRule.store.name }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]" v-if="priceRule.ruleType === 'quantity'">
          <a-col :span="24">
            <a-descriptions bordered>
              <a-descriptions-item label="Minimum Quantity">
                {{ priceRule.minQuantity }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]" v-if="priceRule.ruleType === 'customer'">
          <a-col :span="24">
            <a-descriptions bordered>
              <a-descriptions-item label="Customer">
                {{ priceRule.customer.name }}
              </a-descriptions-item>
            </a-descriptions>
          </a-col>
        </a-row>
      </div>
      <div v-else class="loading">
        Loading price rule details...
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useProductStore } from '~/stores/product/ProductStore.js';
  
  const props = defineProps({
    priceRuleId: {
      type: Number,
      required: true,
    },
  });
  
  const productStore = useProductStore();
  const priceRule = computed(() => productStore.priceRuleById(parseInt(props.priceRuleId)));
  
  watch(
    () => props.priceRuleId,
    (newId) => {
      // Update the priceRule when priceRuleId changes
      priceRule.value = productStore.priceRuleById(parseInt(newId));
    }
  );
  </script>
  
  <style scoped>
  .price-rule-details {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    margin-top: 0;
    font-size: 24px;
    color: #333;
  }
  
  .divider {
    margin-bottom: 20px;
    margin-top: 10px;
  }
  
  .loading {
    text-align: center;
    color: #999;
    font-size: 16px;
    margin-top: 20px;
  }
  
  .ant-descriptions {
    background-color: #fff;
    border-radius: 8px;
    padding: 16px;
  }
  
  .ant-descriptions-item-label {
    font-weight: bold;
    color: #555;
  }
  
  .ant-descriptions-item-content {
    color: #333;
  }
  </style>