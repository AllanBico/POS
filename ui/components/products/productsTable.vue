<template>
  <div>
    <a-modal v-model:open="open" title="Add Product" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <attribute-add-modal @submit-success="handleSubmitSuccess"></attribute-add-modal>
      <template #footer>
      </template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit Product" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <attribute-edit-modal @submit-success="handleSubmitSuccess" :attribute_id="attribute_id"></attribute-edit-modal>
      <template #footer>
      </template>
    </a-modal>
  </div>
  <div>
  </div>
  <div class="coupons-container">
    <a-card  bordered={false}>
      <div class="header-controls">
        <a-input-search
            placeholder="Search"
            style="width: 200px;"
        />

        <div class="actions">
          <a-button type="primary" @click="handleAdd" :icon="h(PlusOutlined)">Add New</a-button>

        </div>
      </div>

      <a-table
          :columns="columns"
          :data-source="productStore.products"
          :pagination="pagination"
          :rowKey="id"
          bordered
          size="small"
          @change="onChange"
      >
        <template
            #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        >
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
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
              Reset
            </a-button>
          </div>
        </template>
        <template #customFilterIcon="{ filtered }">
          <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'status'">
        <span>
          <a-tag
              :key="record.id"
              :color="record.status ? 'success' : 'error'"
          >
          {{ record.status ? 'Active' : 'Inactive' }} {{record.status}}
        </a-tag>

        </span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-tooltip title="Values" placement="bottom">
              <a-button @click="onValues(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-popconfirm
                v-if="productStore.products.length"
                title="Sure to delete?"
                @confirm="onDelete(record.id)">
              <a-tooltip title="Delete" placement="bottom">
                <a-button :icon="h(DeleteOutlined)"/>
              </a-tooltip>
            </a-popconfirm>

          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref} from 'vue';
import {DeleteOutlined, EditOutlined,PlusOutlined} from "@ant-design/icons-vue";
import { useProductStore } from '~/stores/product.js';
const productStore = useProductStore();
import AttributeAddModal from "~/components/attributes/attributeAddModal.vue";
import AttributeEditModal from "~/components/attributes/attributeEditModal.vue";
const loading = ref(false);
const open = ref(false);
const edit_open = ref(false);
let attribute_id = ref(null)
productStore.fetchProducts()
console.log("productStore.attributes", productStore.products)
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    scopedSlots: { customRender: 'price' },
  },
  {
    title: 'Category',
    dataIndex: 'categoryId',
    key: 'categoryId',
    scopedSlots: { customRender: 'category' },
  },
  {
    title: 'Subcategory',
    dataIndex: 'subcategoryId',
    key: 'subcategoryId',
    scopedSlots: { customRender: 'subcategory' },
  },
  {
    title: 'Action',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];

const pagination = ref({pageSize: 10});
const edit = key => {
};
const save = key => {
};
const onDelete = async key => {
  await attributesStore.deleteAttribute(key)
  console.log("deleted", key)
};
const onEdit = async key => {
  console.log("edit", key)
  attribute_id = parseInt(key)
  console.log("attribute_id", attribute_id)
  edit_open.value = true
  console.log("done")
};

const onValues = async key => {
  await router.push({name: 'attribute-values-id', params: {id: key}});
};

const handleAdd = () => {
  open.value = true;
};
const handleOk = () => {
  open.value = false;
  // Optionally handle any additional logic here
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
const handleReset = clearFilters => {
  clearFilters({
    confirm: true,
  });
  state.searchText = '';
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
  align-items: end;
}

.actions a-button {
  margin-left: 2px;
}
</style>
