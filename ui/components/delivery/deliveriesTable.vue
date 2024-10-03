<template>
  <div class="div-container">
    <!-- Modals -->
    <a-modal
        v-model:open="isAddModalOpen"
        title="Create Delivery"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        ok-text="Submit"
        width="100%"
        cancel-text="Cancel"
        :maskClosable="false"
    >
      <delivery-add-modal @submit-success="handleSubmitSuccess"></delivery-add-modal>
      <template #footer></template>
    </a-modal>

    <a-modal
        v-model:open="isEditModalOpen"
        title="Edit Delivery"
        @ok="handleModalOk"
        @cancel="handleModalCancel"
        ok-text="Submit"
        width="100%"
        cancel-text="Cancel"
        :maskClosable="false"
    >
      <delivery-edit-modal
          @submit-success="handleSubmitSuccess"
          :delivery_id="selectedDeliveryId"
      ></delivery-edit-modal>
      <template #footer></template>
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header
          class="div-header"
          title="Deliveries"
          sub-title="Manage and track your delivery notes"
      >
        <template #extra>
          <a-button
              class="add-delivery-btn"
              type="primary"
              @click="handleAddDelivery"
              :icon="h(PlusOutlined)"
          >
            Create Delivery
          </a-button>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="exportToExcel">
                  <FileExcelOutlined /> Excel
                </a-menu-item>
                <a-menu-item key="2" @click="exportToPDF">
                  <FilePdfOutlined /> PDF
                </a-menu-item>
              </a-menu>
            </template>
            <a-button class="export-btn">
              Export <DownOutlined />
            </a-button>
          </a-dropdown>
        </template>
      </a-page-header>
    </a-card>

    <!-- Deliveries table -->
    <div class="div-table-container">
      <a-table
          :dataSource="deliveryStore.deliveries"
          :columns="columns"
          :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
          :rowKey="(record) => record.id"
          :loading="deliveryStore.loading"
          size="middle"
          @change="handleTableChange"
      >
        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                    type="link"
                    class="edit-btn"
                    @click="handleEditDelivery(record.id)"
                    :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="View">
                <a-button
                    type="link"
                    class="edit-btn"
                    @click="onValues(record.id)"
                    :style="{ color: '#1890ff' }"
                >
                  <template #icon><EyeOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                  :title="`Are you sure you want to delete this delivery?`"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="handleDeleteDelivery(record.id)"
                  placement="topRight"
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
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="view">
                      <EyeOutlined /> View Details
                    </a-menu-item>
                    <a-menu-item key="duplicate">
                      <CopyOutlined /> Duplicate
                    </a-menu-item>
                    <a-menu-item key="archive">
                      <InboxOutlined /> Archive
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link">
                  <MoreOutlined style="font-size: 16px;" />
                </a-button>
              </a-dropdown>
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
import { useDeliveryStore } from '~/stores/delivery/DeliveryStore.js'; // Delivery Pinia store
import deliveryAddModal from '~/components/delivery/deliveryAddModal.vue';
import deliveryEditModal from '~/components/delivery/deliveryEditModal.vue';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  EyeOutlined,
  CopyOutlined,
  InboxOutlined,
  MoreOutlined,
} from '@ant-design/icons-vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import deliveryView from "~/components/delivery/deliveryView.vue";
import {useTabsStore} from "~/stores/tabsStore.js";

// Initialize delivery store and fetch deliveries
const deliveryStore = useDeliveryStore();
const tabsStore = useTabsStore();
deliveryStore.fetchDeliveries();
console.log("deliveryStore.deliveries",deliveryStore.deliveries)
// Reactive variables
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedDeliveryId = ref(null);


const onValues = async key => {
  tabsStore.addTab('Delivery', deliveryView, { delivery_id: key });
};
// Table columns configuration
const columns = [
  {
    title: '#',
    dataIndex: 'index',
    width: '5%',
    sorter: (a, b) => a.index - b.index,
    onFilter: (value, record) => record.index.toString().includes(value),
  },
  {
    title: 'Delivery Address',
    dataIndex: 'deliveryAddress',
    sorter: (a, b) => a.deliveryAddress.localeCompare(b.deliveryAddress),
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.deliveryAddress.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Delivery Person',
    dataIndex: 'deliveryPerson',
    sorter: (a, b) => a.deliveryPerson.localeCompare(b.deliveryPerson),
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.deliveryPerson.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    sorter: (a, b) => a.status.localeCompare(b.status),
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
  },
];

// Event handlers
const handleAddDelivery = () => {
  isAddModalOpen.value = true;
};

const handleEditDelivery = (deliveryId) => {
  selectedDeliveryId.value = deliveryId;
  isEditModalOpen.value = true;
};

const handleDeleteDelivery = async (deliveryId) => {
  try {
    await deliveryStore.deleteDelivery(deliveryId);
    console.log('Delivery deleted successfully:', deliveryId);
  } catch (error) {
    console.error('Error deleting delivery:', error);
    // TODO: Implement user-friendly error handling
  }
};

const handleModalOk = () => {
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
};

const handleModalCancel = () => {
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
};

const handleSubmitSuccess = () => {
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
};

const handleTableChange = (pagination, filters, sorter) => {
  console.log('Table changed:', pagination, filters, sorter);
  // TODO: Implement table change logic if needed
};

const exportToExcel = () => {
  const data = deliveryStore.deliveries.map(delivery => ({
    Address: delivery.deliveryAddress,
    Person: delivery.deliveryPerson,
    Status: delivery.status,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Deliveries');
  XLSX.writeFile(wb, 'deliveries.xlsx');
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Address', 'Person', 'Status']],
    body: deliveryStore.deliveries.map(delivery => [
      delivery.deliveryAddress,
      delivery.deliveryPerson,
      delivery.status,
    ]),
  });
  doc.save('deliveries.pdf');
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

.add-delivery-btn {
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
</style>
