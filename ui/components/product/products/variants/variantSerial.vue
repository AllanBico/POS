<template>
  <div class="div-container">


    <!-- Header -->
    <a-card class="div-header-card" :bordered="false">
      <a-page-header
          class="div-header"
          :title="`Serial Numbers of ${variant?.sku}`"
          sub-title="Manage and organize your serial numbers"
      >
        <template #extra>
          <a-button
              class="add-category-btn"
              type="primary"
              @click="handleAddCategory"
              :icon="h(PlusOutlined)"
          >
            Create Category
          </a-button>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="exportToExcel">
                  <FileExcelOutlined />  Excel
                </a-menu-item>
                <a-menu-item key="2" @click="exportToPDF">
                  <FilePdfOutlined />  PDF
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

    <!-- Categories table -->
    <div class="div-table-container">
      <a-table
          :dataSource="serialNumbers"
          :columns="columns"
          :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
          :rowKey="(record) => record.id"
          :loading="serialStore.loading"
          size="middle"
          @change="handleTableChange"
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
                @change="
                (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
              "
                @pressEnter="
                handleSearch(selectedKeys, confirm, column.dataIndex)
              "
            />
            <a-button
                type="primary"
                @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon><SearchOutlined /></template>
              Search
            </a-button>
            <a-button @click="handleReset(clearFilters)">
              Reset
            </a-button>
          </div>
        </template>

        <!-- Custom filter icon -->
        <template #customFilterIcon="{ filtered }">
          <search-outlined
              :class="{ 'text-primary': filtered }"
          />
        </template>

        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                    type="link"
                    class="edit-btn"
                    @click="handleEditCategory(record.id)"
                    :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                  :title="`Are you sure you want to delete ${record.name}?`"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="handleDelete(record.id)"
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
<script setup >
import {useSerialNumberStore} from "~/stores/SerialNumberStore.js";
import {
  CopyOutlined,
  DeleteOutlined, DownOutlined, EditOutlined,
  EyeOutlined, FileExcelOutlined,
  FilePdfOutlined,
  InboxOutlined, MoreOutlined,
  PlusOutlined, SearchOutlined
} from "@ant-design/icons-vue";
import {useProductStore} from "~/stores/product/ProductStore.js";
const productStore = useProductStore();
const columns = [
  {
    title: "#",
    dataIndex: "index",
    width:"5%",
    sorter: (a, b) => a.index - b.index,
    onFilter: (value, record) => record.index.toString().includes(value),
  },
  {
    title: "Serial Number",
    dataIndex: "serialNumber",
    sorter: (a, b) => a.name.localeCompare(b.name),
    customFilterDropdown: true,
    onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value?.focus();
        }, 100);
      }
    },
  },

  {
    title: "Operation",
    dataIndex: "operation",
  },
];

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});
const serialStore = useSerialNumberStore();
const serialNumbers = await  serialStore.fetchSerialNumbersByVariantId(parseInt(props.id))
const variant = await productStore.variantById(parseInt(props.id))
console.log("serialNumbers",serialNumbers)

const handleDelete = async (serialId) => {
  try {
    await serialStore.deleteSerialNumber(serialId);
  } catch (error) {
    console.error("Error deleting category:", error);
    // TODO: Implement user-friendly error handling
  }
};
</script>



<style scoped>

</style>