<template>
  <div>
    <a-modal v-model:open="open" title="Add Attribute" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <attribute-value-add-modal  @submit-success="handleSubmitSuccess"></attribute-value-add-modal>
      <template #footer>
      </template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit Attribute" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <attribute-value-edit-modal @submit-success="handleSubmitSuccess" :attribute_value_id="attribute_value_id"></attribute-value-edit-modal>
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
          :data-source="values"
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
            <a-tooltip title="Edit" placement="bottom">
              <a-button @click="onEdit(record.id)" style="margin-right: 3px" :icon="h(EditOutlined)"/>
            </a-tooltip>
            <a-popconfirm
                v-if="values.length"
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
import {ref, watch} from 'vue';
import {DeleteOutlined, EditOutlined,PlusOutlined} from "@ant-design/icons-vue";
import { useAttributesStore } from '~/stores/attribute.js';
const attributesStore = useAttributesStore();
import AttributeValueAddModal from "~/components/attributes/AttributeValueAddModal.vue";
import AttributeValueEditModal from "~/components/attributes/AttributeValueEditModal.vue";

const open = ref(false);
const edit_open = ref(false);
let attribute_value_id = ref(null)
const route = useRoute();
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
let  attribute_id = props.id
attributesStore.fetchAttributeValues()
const values = computed(() => attributesStore.ValuesByAttributeId(parseInt(props.id)));
watch(() => props.id, (newcategoryId) => {
  attribute_id = newcategoryId;
}, { immediate: true });
const columns = [
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'name',
    width: '30%',
    sorter: (a, b) => a.value.localeCompare(b.value),
    sortDirections: ['descend', 'ascend'],
    customFilterDropdown: true,
    onFilter: (value, record) => record.value.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: 'operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const pagination = ref({pageSize: 10});
const edit = key => {
};
const save = key => {
};
const onDelete = async key => {
  await attributesStore.deleteAttributeValue(key)
  console.log("deleted", key)
};
const onEdit = async key => {
  console.log("edit", key)
  attribute_value_id = parseInt(key)
  console.log("attribute_value_id", attribute_value_id)
  edit_open.value = true
  console.log("done")
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
