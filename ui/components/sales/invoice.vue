<template>
  <div class="invoice-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Invoice"
        sub-title="View and manage invoice details"
      >
        <template #extra>
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
        </template>
      </a-page-header>
    </a-card>

    <div class="invoice-content">
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
                <td>{{ invoice.number }}</td>
              </tr>
              <tr>
                <td><strong>Date Issued:</strong></td>
                <td>{{ invoice.dateIssued }}</td>
              </tr>
              <tr>
                <td><strong>Due Date:</strong></td>
                <td>{{ invoice.dueDate }}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="customer-info">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <h4>{{ customer.name }}</h4>
            <p>{{ customer.address }}</p>
            <p>{{ customer.city }}, {{ customer.state }} {{ customer.zipCode }}</p>
            <p>{{ customer.country }}</p>
            <p>{{ customer.email }}</p>
            <p>{{ customer.phone }}</p>
          </div>
          <div class="ship-to">
            <h3>Ship To:</h3>
            <h4>{{ customer.name }}</h4>
            <p>{{ customer.shippingAddress }}</p>
            <p>{{ customer.shippingCity }}, {{ customer.shippingState }} {{ customer.shippingZipCode }}</p>
            <p>{{ customer.shippingCountry }}</p>
          </div>
        </div>

        <a-table
          :dataSource="invoice.items"
          :columns="columns"
          :pagination="false"
          :rowKey="record => record.id"
          class="invoice-items-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'total'">
              {{ formatPrice(record.quantity * record.unitPrice) }}
            </template>
          </template>
        </a-table>

        <div class="invoice-summary">
          <div class="summary-table">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td>{{ formatPrice(invoice.subtotal) }}</td>
              </tr>
              <tr>
                <td>Tax ({{ invoice.taxRate }}%):</td>
                <td>{{ formatPrice(invoice.tax) }}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td>{{ formatPrice(invoice.shipping) }}</td>
              </tr>
              <tr>
                <td>Discount:</td>
                <td>{{ formatPrice(invoice.discount) }}</td>
              </tr>
              <tr class="total-row">
                <td><strong>Total:</strong></td>
                <td><strong>{{ formatPrice(invoice.total) }}</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <div class="invoice-footer">
          <div class="notes">
            <h3>Notes:</h3>
            <p>{{ invoice.notes }}</p>
          </div>
          <div class="terms">
            <h3>Terms and Conditions:</h3>
            <p>{{ invoice.terms }}</p>
          </div>
          <p class="thank-you">Thank you for your business!</p>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {message} from 'ant-design-vue';

const invoiceContent = ref(null);
const invoice = ref({
  number: 'INV-001',
  dateIssued: new Date().toLocaleDateString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 30 days from now
  items: [
    {id: 1, name: 'Product 1', description: 'High-quality widget', quantity: 2, unitPrice: 20},
    {id: 2, name: 'Product 2', description: 'Premium gadget', quantity: 1, unitPrice: 100},
    {id: 3, name: 'Service 1', description: 'Professional consultation', quantity: 3, unitPrice: 75},
  ],
  subtotal: 365,
  taxRate: 10,
  tax: 36.5,
  shipping: 15,
  discount: 20,
  total: 396.5,
  notes: 'Payment is due within 30 days. Late payments are subject to a 1.5% monthly fee.',
  terms: 'By paying this invoice, you agree to our terms of service available at www.example.com/terms',
});

const customer = ref({
  name: 'John Doe',
  address: '123 Main St',
  city: 'Anytown',
  state: 'ST',
  zipCode: '12345',
  country: 'United States',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  shippingAddress: '456 Shipping Lane',
  shippingCity: 'Shiptown',
  shippingState: 'ST',
  shippingZipCode: '67890',
  shippingCountry: 'United States',
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
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
  },
  {
    title: 'Unit Price',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
    customRender: ({text}) => formatPrice(text),
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
];

const formatPrice = (price) => `$${price.toFixed(2)}`;

const printInvoice = () => {
  const printContent = invoiceContent.value.outerHTML;
  const win = window.open('', '', 'width=800,height=600');
  win.document.write('<html><head><title>Invoice</title>');
  win.document.write('<link rel="stylesheet" type="text/css" href="/path/to/your/invoice-print-styles.css">');
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
  doc.text(`Invoice Number: ${invoice.value.number}`, 150, 30);
  doc.text(`Date Issued: ${invoice.value.dateIssued}`, 150, 35);
  doc.text(`Due Date: ${invoice.value.dueDate}`, 150, 40);

  // Add customer details
  doc.text('Bill To:', 10, 75);
  doc.text(customer.value.name, 10, 80);
  doc.text(customer.value.address, 10, 85);
  doc.text(`${customer.value.city}, ${customer.value.state} ${customer.value.zipCode}`, 10, 90);
  doc.text(customer.value.country, 10, 95);

  // Add invoice items
  const items = invoice.value.items.map(item => [
    item.name,
    item.description,
    item.quantity,
    formatPrice(item.unitPrice),
    formatPrice(item.quantity * item.unitPrice)
  ]);

  autoTable(doc, {
    startY: 105,
    head: [['Item', 'Description', 'Quantity', 'Unit Price', 'Total']],
    body: items,
  });

  // Add totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: ${formatPrice(invoice.value.subtotal)}`, 150, finalY);
  doc.text(`Tax (${invoice.value.taxRate}%): ${formatPrice(invoice.value.tax)}`, 150, finalY + 5);
  doc.text(`Shipping: ${formatPrice(invoice.value.shipping)}`, 150, finalY + 10);
  doc.text(`Discount: ${formatPrice(invoice.value.discount)}`, 150, finalY + 15);
  doc.setFontSize(12);
  doc.text(`Total: ${formatPrice(invoice.value.total)}`, 150, finalY + 25);

  // Add notes and terms
  doc.setFontSize(10);
  doc.text('Notes:', 10, finalY + 40);
  doc.text(invoice.value.notes, 10, finalY + 45);
  doc.text('Terms and Conditions:', 10, finalY + 55);
  doc.text(invoice.value.terms, 10, finalY + 60);

  // Save the PDF
  doc.save(`Invoice-${invoice.value.number}.pdf`);
};

const sendInvoice = () => {
  // Implement your email sending logic here
  message.success('Invoice sent successfully!');
};
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

.header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #001529;
}

.action-btn {
  font-size: 14px;
  height: 36px;
  margin-right: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.invoice-content {
  background-color: #ffffff;
  padding: 24px;
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
  margin-bottom: 24px;
}

.company-logo img {
  max-width: 200px;
  height: auto;
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
  margin-bottom: 24px;
}

.bill-to, .ship-to {
  width: 48%;
}

.invoice-items-table {
  margin-bottom: 24px;
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

.invoice-summary {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
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

.notes, .terms {
  margin-bottom: 16px;
}

.thank-you {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
  margin-top: 24px;
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
