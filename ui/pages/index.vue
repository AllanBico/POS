<template>
  <div class="coupons-container">
    <a-card title="Coupons" bordered={false}>
      <div class="header-controls">
        <a-input-search
            placeholder="Search"
            v-model:value="searchTerm"
            style="width: 200px;"
            @search="handleSearch"
        />

        <div class="actions">
          <a-button type="primary" @click="addCoupon">
            <a-icon type="plus" />
            Add New Coupons
          </a-button>
        </div>
      </div>

      <a-table
          :columns="columns"
          :dataSource="coupons"
          :pagination="pagination"
          rowKey="id"
          bordered
      >
        <template #name="{ text }">
          {{ text }}
        </template>
        <template #code="{ text }">
          <a-tag color="red">{{ text }}</a-tag>
        </template>
        <template #type="{ text }">
          {{ text }}
        </template>
        <template #discount="{ text }">
          {{ text }}
        </template>
        <template #limit="{ text }">
          {{ text }}
        </template>
        <template #used="{ text }">
          {{ text }}
        </template>
        <template #valid="{ text }">
          {{ text }}
        </template>
        <template #status="{ text }">
          <a-badge status="success" text="Active" />
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" icon="edit" @click="editCoupon(record.id)" />
            <a-button type="link" icon="delete" @click="deleteCoupon(record.id)" />
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const searchTerm = ref('');

const coupons = ref([
  { id: 1, name: 'Coupons 21', code: 'Christmas', type: 'Fixed', discount: '$20', limit: '04', used: '01', valid: '04 Jan 2023', status: 'Active' },
  { id: 2, name: 'First Offer', code: 'First Offer', type: 'Percentage', discount: '10%', limit: '47', used: '10', valid: '15 Feb 2023', status: 'Active' },
  { id: 3, name: 'Offer 40', code: '40% Offer', type: 'Fixed', discount: '$20', limit: '21', used: '14', valid: '08 Apr 2023', status: 'Active' },
  { id: 4, name: 'Subscription', code: 'FirstSub01', type: 'Fixed', discount: '$20', limit: '09', used: '07', valid: '12 Aug 2023', status: 'Active' },
]);

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
    scopedSlots: { customRender: 'code' },
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'Discount',
    dataIndex: 'discount',
    key: 'discount',
  },
  {
    title: 'Limit',
    dataIndex: 'limit',
    key: 'limit',
  },
  {
    title: 'Used',
    dataIndex: 'used',
    key: 'used',
  },
  {
    title: 'Valid',
    dataIndex: 'valid',
    key: 'valid',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: 'Action',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];

const pagination = ref({ pageSize: 10 });

const handleSearch = (value) => {
  console.log('Search:', value);
};

const addCoupon = () => {
  console.log('Add Coupon');
};

const editCoupon = (id) => {
  console.log('Edit Coupon:', id);
};

const deleteCoupon = (id) => {
  console.log('Delete Coupon:', id);
};
</script>

<style scoped>
.coupons-container {
  padding: 20px;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  align-items: center;
}

.actions a-button {
  margin-left: 10px;
}
</style>
