<template>
  <div>
    <a-modal v-model:open="open" title="Add Coupon" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
      <coupon-add-modal @submit-success="handleSubmitSuccess"></coupon-add-modal>
      <template #footer></template>
    </a-modal>

    <a-modal v-model:open="edit_open" title="Edit Coupon" @ok="handleOk" @cancel="handleCancel" ok-text="Submit" cancel-text="Cancel">
      <coupon-edit-modal @submit-success="handleSubmitSuccess" :coupon-id="coupon_id"></coupon-edit-modal>
      <template #footer></template>
    </a-modal>

    <a-card title="Coupons" bordered={false}>
      <div class="header-controls">
        <div class="actions">
          <a-button ref="addButton" type="primary" @click="handleAdd" :icon="h(PlusOutlined)">Add New</a-button>
        </div>
      </div>

      <a-table
          :columns="columns"
          :data-source="couponStore.coupons"
          :pagination="pagination"
          :rowKey="id"
          bordered
          size="small"
          @change="onChange"
      >
        <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
          <div style="padding: 8px">
            <a-input
                ref="searchInput"
                :placeholder="`Search ${column.dataIndex}`"
                :value="selectedKeys[0]"
                style="width: 188px; margin-bottom: 8px; display: block"
                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
                type="primary"
                size="small"
                style="width: 90px; margin-right: 8px"
                @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon><SearchOutlined /></template>
              Search
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">Reset</a-button>
          </div>
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)" />
            </a-tooltip>
            <a-popconfirm
                v-if="couponStore.coupons.length"
                title="Sure to delete?"
                @confirm="onDelete(record.id)"
            >
              <a-tooltip title="Delete" placement="bottom">
                <a-button :icon="h(DeleteOutlined)" />
              </a-tooltip>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Tour Component -->
    <a-tour :steps="steps" v-model:open="tourOpen" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCouponStore } from '~/stores/CouponStore.js';
import CouponAddModal from '~/components/coupons/CouponAddModal.vue';
import CouponEditModal from '~/components/coupons/CouponEditModal.vue';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { Tour } from 'ant-design-vue';

const couponStore = useCouponStore();
const open = ref(false);
const edit_open = ref(false);
const coupon_id = ref(null);
const tourOpen = ref(false);

couponStore.fetchCoupons();

const columns = [
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
    width: '20%',
    sorter: (a, b) => a.code.localeCompare(b.code),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.code.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Discount Type',
    dataIndex: 'discountType',
    key: 'discountType',
    width: '20%',
    sorter: (a, b) => a.discountType.localeCompare(b.discountType),
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'Discount Value',
    dataIndex: 'discountValue',
    key: 'discountValue',
    width: '20%',
    sorter: (a, b) => a.discountValue - b.discountValue,
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'Usage Limit',
    dataIndex: 'usageLimit',
    key: 'usageLimit',
    width: '20%',
    sorter: (a, b) => a.usageLimit - b.usageLimit,
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'Used Count',
    dataIndex: 'usageCount',
    key: 'usageCount',
    width: '20%',
    sorter: (a, b) => a.usageCount - b.usageCount,
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const pagination = ref({ pageSize: 10 });

// Tour steps definition
const steps = [
  {
    title: 'Add Coupon',
    description: 'Click here to add a new coupon.',
    target: () => document.querySelector('.header-controls .actions .ant-btn'),
    placement: 'bottom'
  },
  {
    title: 'Search Coupons',
    description: 'Use this search bar to filter coupons by code.',
    target: () => document.querySelector('.ant-input'),
    placement: 'bottom'
  },
  {
    title: 'Coupon Table',
    description: 'This table shows all coupons, with options to edit or delete.',
    target: () => document.querySelector('.ant-table'),
    placement: 'top'
  }
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

const onChange = (pagination, filters, sorter) => {
  console.log('params', pagination, filters, sorter);
};

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = (clearFilters) => {
  clearFilters({
    confirm: true,
  });
  state.searchText = '';
};

// Start tour
const startTour = () => {
  tourOpen.value = true;
};

// Optional: start the tour on component mount or after a specific action
//  onMounted(() => {
//    startTour();
//  });
</script>

<style scoped>
.coupons-container {
  padding: 16px;
}
.header-controls {
  margin-bottom: 16px;
}
.actions {
  text-align: right;
}
</style>
