<template>
  <div class="div-container">
    <!-- Modals -->
    <a-modal
      v-model:open="open"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      width="80%"
      :maskClosable="false"
    >
      <coupon-add-modal @submit-success="handleSubmitSuccess" />
      <template #footer />
    </a-modal>

    <a-modal
      v-model:open="edit_open"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <coupon-edit-modal
        @submit-success="handleSubmitSuccess"
        :coupon-id="coupon_id"
      />
      <template #footer />
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header
        class="div-header"
        title="Coupons"
        style="padding: 0%;"
        sub-title="Manage and organize your coupons"
      >
        <template #extra>
          <a-button
            class="add-coupon-btn"
            type="primary"
            @click="handleAdd"
            :icon="h(PlusOutlined)"
          >
            Add New
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <!-- Coupons table -->
    <div class="div-table-container">
      <a-table
        :dataSource="couponStore.coupons"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="couponStore.loading"
        size="middle"
        bordered
      >
        <!-- Custom filter dropdown template -->
        <template
          #customFilterDropdown="{
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            column,
          }"
        >
          <div class="custom-filter-dropdown">
            <a-input
              ref="searchInput"
              :placeholder="`Search ${column.title}`"
              :value="selectedKeys[0]"
              @change="(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              "
              @pressEnter="
                handleSearch(selectedKeys, confirm, column.dataIndex)
              "
            />
            <a-button
              type="primary"
              @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon>
                <SearchOutlined />
              </template>
              Search
            </a-button>
            <a-button @click="handleReset(clearFilters)">Reset</a-button>
          </div>
        </template>

        <!-- Custom filter icon -->
        <template #customFilterIcon="{ filtered }">
          <search-outlined :class="{ 'text-primary': filtered }" />
        </template>

        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="operation-buttons">
              <a-tooltip title="Edit">
                <a-popconfirm
                  title="Are you sure you want to edit this coupon?"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="onEdit(record.id)"
                >
                  <a-button
                    class="edit-btn"
                    :style="{ color: '#1890ff' }"
                  >
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-popconfirm>
              </a-tooltip>
              <a-tooltip title="Delete">
                <a-popconfirm
                  title="Are you sure you want to delete this coupon?"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="onDelete(record.id)"
                >
                  <a-button
                    class="delete-btn"
                    :style="{ color: '#ff4d4f' }"
                  >
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-popconfirm>
              </a-tooltip>
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
import { ref } from 'vue';
import { useCouponStore } from '~/stores/CouponStore.js';
import CouponAddModal from '~/components/coupons/CouponAddModal.vue';
import CouponEditModal from '~/components/coupons/CouponEditModal.vue';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
} from '@ant-design/icons-vue';

const couponStore = useCouponStore();
const open = ref(false);
const edit_open = ref(false);
const coupon_id = ref(null);

couponStore.fetchCoupons();

const columns = [

  {
    title: 'Code',
    dataIndex: 'code',
    sorter: (a, b) => a.code.localeCompare(b.code),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.code.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Discount Type',
    dataIndex: 'discountType',
    sorter: (a, b) => a.discountType.localeCompare(b.discountType),
  },
  {
    title: 'Discount Value',
    dataIndex: 'discountValue',
    sorter: (a, b) => a.discountValue - b.discountValue,
  },
  {
    title: 'Usage Limit',
    dataIndex: 'usageLimit',
    sorter: (a, b) => a.usageLimit - b.usageLimit,
  },
  {
    title: 'Used Count',
    dataIndex: 'usageCount',
    sorter: (a, b) => a.usageCount - b.usageCount,
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
  },
];

const onDelete = async (key) => {
  await couponStore.deleteCoupon(key);
  console.log('deleted', key);
};

const onEdit = async (key) => {
  coupon_id.value = parseInt(key);
  edit_open.value = true;
};

const handleAdd = () => {
  open.value = true;
};

const handleOk = () => {
  open.value = false;
};

const handleCancel = () => {
  open.value = false;
  edit_open.value = false;
};

const handleSubmitSuccess = () => {
  open.value = false;
  edit_open.value = false;
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  // TODO: Implement search functionality
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
  // TODO: Reset search state
};
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

.add-coupon-btn {
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

.edit-link,
.delete-link {
  color: #001529;
}

.edit-link:hover,
.delete-link:hover {
  color: #ff4d4f;
}

.text-primary {
  color: #1890ff;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: 16px;
  cursor: pointer;
}
</style>
