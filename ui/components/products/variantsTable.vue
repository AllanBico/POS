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
    <a-card bordered={false}>
      <div class="header-controls">
        <a-input-search
            placeholder="Search"
            style="width: 200px;"
        />

        <div class="actions">
          <a-button type="primary" :icon="h(PlusOutlined)">
            <nuxt-link to="/product/create-product">Add New</nuxt-link>
          </a-button>

        </div>
      </div>

      <a-table
          :columns="columns"
          :data-source="productStore.variants"
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
              <template #icon>
                <SearchOutlined/>
              </template>
              Search
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
              Reset
            </a-button>
          </div>
        </template>
        <template #customFilterIcon="{ filtered }">
          <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }"/>
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'stockQuantity'">
            {{record.stockQuantity}} <span v-if="record.Product.unitId">{{record.Product.Unit.abbreviation}}</span>
          </template>
          <template v-if="column.dataIndex === 'variantAttributeValues'">
            <span v-for="(attribute, index) in record.variantAttributeValues">
              <a-tag color="blue"
                     style="margin-bottom: 1px;">{{ attribute.AttributeValue.Attribute.name }} : {{ attribute.AttributeValue.value }}</a-tag>
            </span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-dropdown :trigger="['click']">
              <a class="ant-dropdown-link" @click.prevent>
                Actions
                <DownOutlined/>
              </a>
              <template #overlay>
                <a-menu>

                  <a-menu-item>
                    <a href="javascript:;" @click="onEdit(record.id)">edit</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a-popconfirm
                        v-if="productStore.variants.length"
                        :title="'Delete ' + record.sku +' ?'"
                        @confirm="onDelete(record.id)">
                      <a href="javascript:;">delete</a>
                    </a-popconfirm>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons-vue";
import {useProductStore} from '~/stores/ProductStore.js';

const productStore = useProductStore();
import AttributeAddModal from "~/components/attributes/attributeAddModal.vue";
import AttributeEditModal from "~/components/attributes/attributeEditModal.vue";

const loading = ref(false);
const open = ref(false);
const edit_open = ref(false);
let attribute_id = ref(null)
productStore.fetchVariants()
console.log("productStore.variants", productStore.variants)
const columns = [
  {
    title: 'Product',
    key: 'sku',
    customRender: ({record}) => record.Product ? record.Product.name : 'N/A',
  },
  {
    title: 'Sku',
    dataIndex: 'sku',
    key: 'sku',
  },
  {
    title: 'Quantity',
    dataIndex: 'stockQuantity',
    key: 'stockQuantity',
  }, {
    title: 'Variant',
    dataIndex: 'variantAttributeValues',
    key: 'variantAttributeValues',
  },
  {
    title: 'Description',
    key: 'description',
    customRender: ({record}) => record.Product ? record.Product.description : 'N/A',
  },
  {
    title: 'Category',
    key: 'category',
    customRender: ({record}) => record.Product ? record.Product.category.name : 'N/A',
    width: '30%',
  },
  {
    title: 'Subcategory',
    customRender: ({record}) => record.Product ? record.Product.subcategory.name : 'N/A',
    key: 'subcategoryId',
    scopedSlots: {customRender: 'subcategory'},
  },
  //
  // {
  //   title: 'VAT',
  //   customRender: ({record}) => record.Product ? record.Product.VATType : 'N/A',
  //   key: 'VATType',
  // },
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
  await productStore.deleteVariant(key)
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
