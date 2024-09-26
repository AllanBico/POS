<template>
  <div class="expense-container">
    <!-- Modals -->
    <a-modal
      v-model:open="open"
      title="Add Expense"
      :footer="null"
      :maskClosable="false"
    >
      <expense-add-modal @submit-success="handleSubmitSuccess"></expense-add-modal>
    </a-modal>

    <a-modal
      v-model:open="edit_open"
      title="Edit Expense"
      :footer="null"
      :maskClosable="false"
    >
      <expense-edit-modal
        @submit-success="handleSubmitSuccess"
        :expense-id="expense_id"
      ></expense-edit-modal>
    </a-modal>

    <!-- Header -->
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Expenses"
        sub-title="Manage and organize your expenses"
      >
        <template #extra>
          <a-button
            class="add-expense-btn"
            type="primary"
            @click="handleAdd"
            :icon="h(PlusOutlined)"
          >
            Add Expense
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

    <!-- Expenses table -->
    <div class="table-container">
      <a-table
        :dataSource="expenseStore.expenses"
        :columns="columns"
        :pagination="pagination"
        :rowKey="(record) => record.id"
        :loading="expenseStore.loading"
        size="middle"
        @change="onChange"
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
          <search-outlined :class="{ 'text-primary': filtered }" />
        </template>

        <!-- Custom render for operation column -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="action-buttons">
              <a-tooltip title="Edit">
                <a-button
                  type="link"
                  class="edit-btn"
                  @click="onEdit(record.id)"
                  :style="{ color: '#1890ff' }"
                >
                  <template #icon><EditOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-popconfirm
                :title="`Are you sure you want to delete this expense?`"
                ok-text="Yes"
                cancel-text="No"
                @confirm="onDelete(record.id)"
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
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useExpenseStore } from '~/stores/expenses/expenseStore.js';
import ExpenseAddModal from "~/components/expenses/expenseAddModal.vue";
import ExpenseEditModal from "~/components/expenses/expenseEditModal.vue";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons-vue";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const expenseStore = useExpenseStore();
expenseStore.fetchExpenses();

const open = ref(false);
const edit_open = ref(false);
const expense_id = ref(null);
const searchInput = ref(null);

const columns = [
  {
    title: 'Expense Category',
    customRender: ({record}) => record.ExpenseCategory ? record.ExpenseCategory.name : '',
    key: 'ExpenseCategory',
    sorter: (a, b) => a.ExpenseCategory.name.localeCompare(b.ExpenseCategory.name),
    customFilterDropdown: true,
    onFilter: (value, record) => record.ExpenseCategory.name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Payment Method',
    customRender: ({record}) => record.PaymentMethod ? record.PaymentMethod.name : '',
    key: 'PaymentMethod',
    sorter: (a, b) => a.PaymentMethod.name.localeCompare(b.PaymentMethod.name),
    customFilterDropdown: true,
    onFilter: (value, record) => record.PaymentMethod.name.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    sorter: (a, b) => a.amount - b.amount,
  },
  {
    title: 'Reference Number',
    dataIndex: 'referenceNumber',
    key: 'referenceNumber',
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    sorter: (a, b) => new Date(a.date) - new Date(b.date),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    sorter: (a, b) => a.description.localeCompare(b.description),
    customFilterDropdown: true,
    onFilter: (value, record) => record.description.toString().toLowerCase().includes(value.toLowerCase()),
  },
  {
    title: 'Operation',
    dataIndex: 'operation',
    key: 'operation',
  },
];

const pagination = ref({
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
});

const onDelete = async (key) => {
  await expenseStore.deleteExpense(key);
};

const onEdit = (key) => {
  expense_id.value = parseInt(key);
  edit_open.value = true;
};

const handleAdd = () => {
  open.value = true;
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
};

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
};

const exportToExcel = () => {
  const data = expenseStore.expenses.map(expense => ({
    Category: expense.ExpenseCategory ? expense.ExpenseCategory.name : '',
    PaymentMethod: expense.PaymentMethod ? expense.PaymentMethod.name : '',
    Amount: expense.amount,
    ReferenceNumber: expense.referenceNumber,
    Date: expense.date,
    Description: expense.description
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");
  XLSX.writeFile(wb, "expenses.xlsx");
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.autoTable({
    head: [['Category', 'Payment Method', 'Amount', 'Reference Number', 'Date', 'Description']],
    body: expenseStore.expenses.map(expense => [
      expense.ExpenseCategory ? expense.ExpenseCategory.name : '',
      expense.PaymentMethod ? expense.PaymentMethod.name : '',
      expense.amount,
      expense.referenceNumber,
      expense.date,
      expense.description
    ]),
  });
  doc.save('expenses.pdf');
};
</script>

<style scoped>
.expense-container {
  background-color: #f0f2f5;
  padding: 24px;
  border-radius: 8px;
}

.header-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.header {
  padding: 16px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
}

.add-expense-btn {
  font-size: 14px;
  height: 36px;
  margin-right: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.export-btn {
  height: 36px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-container {
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
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-filter-dropdown button {
  width: 100px;
  margin-right: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.text-primary {
  color: #1890ff;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .ant-btn-link {
  padding: 0;
}
</style>
