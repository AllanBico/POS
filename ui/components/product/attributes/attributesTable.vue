<template>
  <div class="div-container">
    <!-- Modals -->
    <a-modal
      v-model:open="open"
      title="Add Attribute"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <attribute-add-modal @submit-success="handleSubmitSuccess"></attribute-add-modal>
      <template #footer></template>
    </a-modal>

    <a-modal
      v-model:open="edit_open"
      title="Edit Attribute"
      @ok="handleOk"
      @cancel="handleCancel"
      ok-text="Submit"
      cancel-text="Cancel"
      :maskClosable="false"
    >
      <attribute-edit-modal @submit-success="handleSubmitSuccess" :attribute_id="attribute_id"></attribute-edit-modal>
      <template #footer></template>
    </a-modal>

    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header
        class="div-header"
        title="Attributes"
        sub-title="Manage and organize your product attributes"
      >
        <template #extra>
          <a-button
            class="add-attribute-btn"
            type="primary"
            @click="handleAdd"
            :icon="h(PlusOutlined)"
          >
            Add New
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <!-- Attributes table -->
    <div class="div-table-container">
      <a-table
        :dataSource="attributesStore.attributes"
        :columns="columns"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        :rowKey="(record) => record.id"
        :loading="attributesStore.loading"
        size="middle"
      >
        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'operation'">
            <a-dropdown :trigger="['click']">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="values">
                    <a @click="onValues(record.id)" class="values-link">
                      <OrderedListOutlined /> Values
                    </a>
                  </a-menu-item>
                  <a-menu-item key="edit">
                    <a @click="onEdit(record.id)" class="edit-link">
                      <EditOutlined /> Edit
                    </a>
                  </a-menu-item>
                  <a-menu-item key="delete">
                    <a-popconfirm
                      :title="`Are you sure you want to delete this attribute: ${record.name}?`"
                      ok-text="Yes"
                      cancel-text="No"
                      @confirm="onDelete(record.id)"
                    >
                      <a class="delete-link"><DeleteOutlined /> Delete</a>
                    </a-popconfirm>
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button class="actions-btn"> Actions <DownOutlined /> </a-button>
            </a-dropdown>
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
import { DeleteOutlined, EditOutlined, PlusOutlined, OrderedListOutlined, DownOutlined } from "@ant-design/icons-vue";
import { useAttributesStore } from '~/stores/product/AttributeStore.js';
import AttributeAddModal from "~/components/product/attributes/attributeAddModal.vue";
import AttributeEditModal from "~/components/product/attributes/attributeEditModal.vue";
import { useTabsStore } from '~/stores/tabsStore.js';
import attributesValuesTable from '~/components/product/attributes/attributesValuesTable.vue';

const attributesStore = useAttributesStore();
const tabsStore = useTabsStore();
const open = ref(false);
const edit_open = ref(false);
let attribute_id = ref(null);

attributesStore.fetchAttributes();

const columns = [
  {
    title: "Index",
    dataIndex: "index",
    sorter: (a, b) => a.index.localeCompare(b.index),
    onFilter: (value, record) =>
      record.index.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.name.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    sorter: (a, b) => a.description.localeCompare(b.description),
    customFilterDropdown: true,
    onFilter: (value, record) =>
      record.description.toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
  },
];

const handleAdd = () => {
  open.value = true;
};

const onEdit = (id) => {
  attribute_id.value = parseInt(id);
  edit_open.value = true;
};

const onDelete = async (id) => {
  try {
    await attributesStore.deleteAttribute(id);
    console.log("Attribute deleted successfully:", id);
  } catch (error) {
    console.error("Error deleting attribute:", error);
    // TODO: Implement user-friendly error handling
  }
};

const onValues = (id) => {
  tabsStore.addTab('Attribute Values', attributesValuesTable, { id });
};

const handleOk = () => {
  open.value = false;
  edit_open.value = false;
};

const handleCancel = () => {
  open.value = false;
  edit_open.value = false;
};

const handleSubmitSuccess = () => {
  open.value = false;
  edit_open.value = false;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.div-header {
  padding: 16px;
}

.div-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
}

.add-attribute-btn {
  font-size: 14px;
  height: 36px;
  margin-right: 8px;
}

.div-table-container {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

.actions-btn {
  background-color: #f0f0f0;
  border-color: #d9d9d9;
}

.actions-btn:hover {
  background-color: #e6e6e6;
  border-color: #d9d9d9;
}

.values-link, .edit-link, .delete-link {
  color: #001529;
}

.values-link:hover, .edit-link:hover, .delete-link:hover {
  color: #ff4d4f;
}
</style>
