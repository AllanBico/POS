<template>
  <div>
    <a-modal v-model:open="open" title="Add User" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <sub-category-add-modal @submit-success="handleSubmitSuccess"></sub-category-add-modal>
      <template #footer>
      </template>
    </a-modal>
    <a-modal v-model:open="edit_open" title="Edit User" @ok="handleOk" @cancel="handleCancel" ok-text="Submit"
             cancel-text="Cancel">
      <sub-category-edit-modal :sub_category_id="sub_category_id" @submit-success="handleSubmitSuccess"/>
      <template #footer>
      </template>
    </a-modal>
  </div>
  <div>
  </div>
  <a-button class="editable-add-btn" style="margin-bottom: 1px ;margin-top: 1px ;" @click="handleAdd">Add</a-button>
  <a-table bordered :data-source="subCategoryStore.subcategories" :columns="columns">

    <template #bodyCell="{ column, text, record }">

      <template v-if="column.dataIndex === 'operation'">
        <a style="margin-right: 3px" @click="onEdit(record.id)">Edit</a>
        <a-popconfirm
            v-if="subCategoryStore.subcategories.length"
            title="Sure to delete?"
            @confirm="onDelete(record.id)">
          <a>Delete</a>
        </a-popconfirm>

      </template>
    </template>
  </a-table>
</template>
<script setup>
import {computed, reactive, ref} from 'vue';
import {cloneDeep} from 'lodash-es';
import {useSubcategoryStore} from '~/stores/SubcategoryStore.js';
import SubCategoryAddModal from "~/components/product/subcategories/subCategoryAddModal.vue";
import SubCategoryEditModal from "~/components/product/subcategories/subCategoryEditModal.vue";

const subCategoryStore = useSubcategoryStore();
const open = ref(false);
const edit_open = ref(false);
let sub_category_id = ref(null)
subCategoryStore.fetchSubcategories()
console.log("subCategoryStore.subcategories", subCategoryStore.subcategories)
const columns = [

  {
    title: 'Category',
    key: 'category',
    customRender: ({record}) => record.Category ? record.Category.name : 'N/A',
    width: '30%',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    width: '30%',
  },
  {
    title: 'Description',
    dataIndex: 'description',
  },
  {
    title: 'operation',
    dataIndex: 'operation',
  },
];


const edit = key => {
};
const save = key => {
};
const onDelete = async key => {
  await subCategoryStore.deleteSubcategory(key)
  console.log("deleted", key)
};
const onEdit = async key => {
  console.log("edit", key)
  sub_category_id = parseInt(key)
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
</script>
<style lang="less" scoped>
.editable-cell {
  position: relative;

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>