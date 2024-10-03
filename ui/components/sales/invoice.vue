<template>
  <div class="invoice-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        :title="`Invoice #${orderDetails.id}`"
        :sub-title="formatDate(orderDetails.createdAt)"
      >
        <template #tags>
          <a-tag :color="getStatusColor(orderDetails.status)">
            {{ orderDetails.status }}
          </a-tag>
        </template>
        <template #extra>
          <a-space>
            <a-button
              class="action-btn"
              type="primary"
              @click="printInvoice"
              :icon="h(PrinterOutlined)"
            >
              Print Invoice
            </a-button>
            <a-button
              class="action-btn"
              @click="downloadInvoice"
              :icon="h(DownloadOutlined)"
            >
              Download PDF
            </a-button>
            <a-button
              class="action-btn"
              @click="sendInvoice"
              :icon="h(MailOutlined)"
            >
              Send Invoice
            </a-button>
          </a-space>
        </template>
      </a-page-header>
    </a-card>

    <div class="invoice-content" ref="invoiceContent">
      <a-card class="invoice-card" :bordered="false">
        <div class="invoice-header">
          <div class="company-info">
            <div class="company-logo">
              <img src="https://its.intellitech.co.ke/static/logo.png" alt="Company Logo"/>
            </div>
            <div class="company-details">
              <h2>{{ companyDetails.name }}</h2>
              <p>{{ companyDetails.address }}</p>
              <p>{{ companyDetails.city }}, {{ companyDetails.state }} {{ companyDetails.zipCode }}</p>
              <p>{{ companyDetails.country }}</p>
              <p>{{ companyDetails.phone }}</p>
              <p>{{ companyDetails.email }}</p>
              <p>{{ companyDetails.website }}</p>
            </div>
          </div>
          <div class="invoice-info">
            <h1>INVOICE</h1>
            <table>
              <tr>
                <td><strong>Invoice Number:</strong></td>
                <td>{{ orderDetails.id }}</td>
              </tr>
              <tr>
                <td><strong>Date Issued:</strong></td>
                <td>{{ formatDate(orderDetails.createdAt) }}</td>
              </tr>
              <tr>
                <td><strong>Due Date:</strong></td>
                <td>{{ formatDate(getDueDate(orderDetails.createdAt)) }}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="customer-info">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <h4>{{ orderDetails?.customer?.name }}</h4>
            <p>{{ orderDetails?.customer?.address }}</p>
            <p>{{ orderDetails?.customer?.city }}, {{ orderDetails?.customer?.country }}</p>
            <p>{{ orderDetails?.customer?.email }}</p>
            <p>{{ orderDetails?.customer?.phone }}</p>
          </div>
          <div class="ship-to">
            <h3>Ship To:</h3>
            <h4>{{ orderDetails?.customer?.name }}</h4>
            <p>{{ orderDetails?.customer?.address }}</p>
            <p>{{ orderDetails?.customer?.city }}, {{ orderDetails?.customer?.country }}</p>
          </div>
        </div>

        <a-table
          :dataSource="orderDetails.lineItems"
          :columns="columns"
          :pagination="false"
          :rowKey="record => record.id"
          class="invoice-items-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'total'">
              {{ formatPrice(record.total) }}
            </template>
          </template>
        </a-table>

        <div class="invoice-summary">
          <div class="summary-table">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td>{{ formatPrice(orderDetails.totalAmount) }}</td>
              </tr>
              <tr>
                <td>Tax:</td>
                <td>{{ formatPrice(orderDetails.taxAmount) }}</td>
              </tr>
              <tr>
                <td>Discount:</td>
                <td>{{ formatPrice(orderDetails.discount) }}</td>
              </tr>
              <tr class="total-row">
                <td><strong>Total:</strong></td>
                <td><strong>{{ formatPrice(orderDetails.netTotal) }}</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <div class="invoice-footer">
          <div class="payment-info">
            <h3>Payment Information:</h3>
            <p><strong>Method:</strong> {{ orderDetails?.payments?.paymentMethod?.name || 'N/A' }}</p>
            <p><strong>Amount Paid:</strong> {{ formatPrice(orderDetails.payments?.amountPaid || 0) }}</p>
            <p><strong>Status:</strong> {{ orderDetails?.payments?.status || 'N/A' }}</p>
          </div>
          <div class="notes">
            <h3>Notes:</h3>
            <p>Payment is due within 30 days. Late payments are subject to a 1.5% monthly fee.</p>
          </div>
          <div class="terms">
            <h3>Terms and Conditions:</h3>
            <p>By paying this invoice, you agree to our terms of service available at www.example.com/terms</p>
          </div>
          <p class="thank-you">Thank you for your business!</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { PrinterOutlined, DownloadOutlined, MailOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSalesOrderStore } from "~/stores/sales/SalesOrderStore.js";

const invoiceContent = ref(null);
const orderDetails = ref({});
const salesOrderStore = useSalesOrderStore();
const props = defineProps({
  orderId: {
    type: Number,
    required: true,
  },
});
const companyDetails = ref({
  name: 'BICO Corporation',
  address: '789 Business Ave, Suite 890',
  city: 'Metropolis',
  state: 'ST',
  zipCode: '54321',
  country: 'United States',
  phone: '(800) 555-1234',
  email: 'info@bicocorp.com',
  website: 'www.bicocorp.com',
});

const columns = [
  {
    title: 'Item',
    dataIndex: ['variant', 'Product', 'name'],
    key: 'name',
  },
  {
    title: 'Description',
    dataIndex: ['variant', 'Product', 'description'],
    key: 'description',
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'Unit Price',
    dataIndex: 'price',
    key: 'price',
    customRender: ({text}) => formatPrice(text),
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
];

const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getDueDate = (createdAt) => {
  const dueDate = new Date(createdAt);
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate;
};

const getStatusColor = (status) => {
  const statusColors = {
    'draft': 'blue',
    'pending': 'orange',
    'completed': 'green',
    'cancelled': 'red',
  };
  return statusColors[status] || 'default';
};

const printInvoice = () => {
  const printContent = invoiceContent.value.outerHTML;
  const win = window.open('', '', 'width=800,height=600');
  win.document.write('<html><head><title>Invoice</title>');
  win.document.write('<style>');
  win.document.write(`
    body { font-family: Arial, sans-serif; }
    .invoice-container { background-color: #ffffff; padding: 40px; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company-logo img { max-width: 200px; height: auto; margin-bottom: 20px; }
    .company-details, .invoice-info { font-size: 14px; }
    .invoice-info h1 { color: #1890ff; font-size: 36px; margin-bottom: 20px; }
    .customer-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .bill-to, .ship-to { width: 48%; }
    .invoice-items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
    .invoice-items-table th, .invoice-items-table td { border: 1px solid #e8e8e8; padding: 12px; text-align: left; }
    .invoice-items-table th { background-color: #fafafa; font-weight: bold; }
    .invoice-summary { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .summary-table { width: 50%; }
    .summary-table table { width: 100%; }
    .summary-table td { padding: 8px 0; }
    .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #1890ff; }
    .invoice-footer { border-top: 1px solid #e8e8e8; padding-top: 24px; }
    .payment-info, .notes, .terms { margin-bottom: 20px; }
    .thank-you { text-align: center; font-size: 18px; font-weight: bold; color: #1890ff; margin-top: 40px; }
  `);
  win.document.write('</style>');
  win.document.write('</head><body>');
  win.document.write(printContent);
  win.document.write('</body></html>');
  win.document.close();
  win.print();
};

const downloadInvoice = () => {
  const doc = new jsPDF();

  // Add company logo
  doc.addImage('https://its.intellitech.co.ke/static/logo.png', 'PNG', 10, 10, 50, 20);

  // Add company details
  doc.setFontSize(10);
  doc.text(companyDetails.value.name, 10, 40);
  doc.text(companyDetails.value.address, 10, 45);
  doc.text(`${companyDetails.value.city}, ${companyDetails.value.state} ${companyDetails.value.zipCode}`, 10, 50);
  doc.text(companyDetails.value.phone, 10, 55);
  doc.text(companyDetails.value.email, 10, 60);

  // Add invoice details
  doc.setFontSize(18);
  doc.text('INVOICE', 150, 20);
  doc.setFontSize(10);
  doc.text(`Invoice Number: ${orderDetails.value.id}`, 150, 30);
  doc.text(`Date Issued: ${formatDate(orderDetails.value.createdAt)}`, 150, 35);
  doc.text(`Due Date: ${formatDate(getDueDate(orderDetails.value.createdAt))}`, 150, 40);

  // Add customer details
  doc.text('Bill To:', 10, 75);
  doc.text(orderDetails.value.customer.name, 10, 80);
  doc.text(orderDetails.value.customer.address, 10, 85);
  doc.text(`${orderDetails.value.customer.city}, ${orderDetails.value.customer.country}`, 10, 90);
  doc.text(orderDetails.value.customer.email, 10, 95);

  // Add invoice items
  const items = orderDetails.value.lineItems.map(item => [
    item.variant.Product.name,
    item.variant.Product.description,
    item.quantity,
    formatPrice(item.price),
    formatPrice(item.total)
  ]);

  autoTable(doc, {
    startY: 105,
    head: [['Item', 'Description', 'Quantity', 'Unit Price', 'Total']],
    body: items,
  });

  // Add totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: ${formatPrice(orderDetails.value.totalAmount)}`, 150, finalY);
  doc.text(`Tax: ${formatPrice(orderDetails.value.taxAmount)}`, 150, finalY + 5);
  doc.text(`Discount: ${formatPrice(orderDetails.value.discount)}`, 150, finalY + 10);
  doc.setFontSize(12);
  doc.text(`Total: ${formatPrice(orderDetails.value.netTotal)}`, 150, finalY + 20);

  // Add payment info
  doc.setFontSize(10);
  doc.text('Payment Information:', 10, finalY + 35);
  doc.text(`Method: ${orderDetails.value.payments[0]?.paymentMethod?.name || 'N/A'}`, 10, finalY + 40);
  doc.text(`Amount Paid: ${formatPrice(orderDetails.value.payments[0]?.amountPaid || 0)}`, 10, finalY + 45);
  doc.text(`Status: ${orderDetails.value.payments[0]?.status || 'N/A'}`, 10, finalY + 50);

  // Add notes and terms
  doc.text('Notes:', 10, finalY + 65);
  doc.text('Payment is due within 30 days. Late payments are subject to a 1.5% monthly fee.', 10, finalY + 70);
  doc.text('Terms and Conditions:', 10, finalY + 80);
  doc.text('By paying this invoice, you agree to our terms of service available at www.example.com/terms', 10, finalY + 85);

  // Save the PDF
  doc.save(`Invoice-${orderDetails.value.id}.pdf`);
};

const sendInvoice = () => {
  // Implement your email sending logic here
  message.success('Invoice sent successfully!');
};

onMounted(async () => {
  try {
    orderDetails.value = await salesOrderStore.fetchOrderById(parseInt(props.orderId)); 
    console.log("orderDetails.value", orderDetails.value);
  } catch (error) {
    console.error('Error fetching order:', error);
    message.error('Failed to load invoice details');
  }
});
</script>

<style scoped>
.invoice-container {
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

.action-btn {
  margin-left: 8px;
}

.invoice-content {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.invoice-card {
  border: none;
  box-shadow: none;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.company-logo img {
  max-width: 200px;
  height: auto;
  margin-bottom: 20px;
}

.company-details, .invoice-info {
  font-size: 14px;
}

.invoice-info h1 {
  color: #1890ff;
  font-size: 36px;
  margin-bottom: 20px;
}

.customer-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}

.bill-to, .ship-to {
  width: 48%;
}

.invoice-items-table {
  margin-bottom: 40px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  color: #001529;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 16px;
}

.invoice-summary {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
}

.summary-table {
  width: 50%;
}

.summary-table table {
  width: 100%;
}

.summary-table td {
  padding: 8px 0;
}

.total-row {
  font-size: 18px;
  font-weight: bold;
  border-top: 2px solid #1890ff;
}

.invoice-footer {
  border-top: 1px solid #e8e8e8;
  padding-top: 24px;
}

.payment-info, .notes, .terms {
  margin-bottom: 20px;
}

.thank-you {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
  margin-top: 40px;
}

@media print {
  .invoice-container {
    background-color: #ffffff;
    padding: 0;
  }

  .header-card,
  .action-btn {
    display: none;
  }

  .invoice-content {
    box-shadow: none;
    padding: 0;
  }
}
</style>
