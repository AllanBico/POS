<template>
  <div class="barcode-print-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Barcode Generator"
        sub-title="Generate and print barcodes for your products"
      >
        <template #extra>
          <a-button type="primary" @click="generateBarcodes" :icon="h(BarcodeOutlined)">
            Generate Barcodes
          </a-button>
          <a-button @click="printBarcodes" :icon="h(PrinterOutlined)" :disabled="!barcodes.length">
            Print Barcodes
          </a-button>
        </template>
      </a-page-header>
    </a-card>

    <div class="content-container">
      <a-card class="options-card" :bordered="false">
        <a-form layout="vertical">
          <a-form-item label="Barcode Type">
            <a-select v-model:value="selectedBarcodeType" style="width: 100%">
              <a-select-option value="serialNumber">Serial Number</a-select-option>
              <a-select-option value="productCode">Product Code</a-select-option>
              <a-select-option value="sku">SKU</a-select-option>
              <a-select-option value="partNumber">Part Number</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item v-if="selectedBarcodeType !== 'serialNumber'" label="Quantity">
            <a-input-number v-model:value="barcodeQuantity" :min="1" style="width: 100%" />
          </a-form-item>
        </a-form>
      </a-card>

      <a-card v-if="barcodeStrings.length" class="preview-card" :bordered="false">
        <template #title>
          <div class="card-title">
            <BarcodeOutlined />
            <span>Barcode Preview</span>
          </div>
        </template>
        <a-list :dataSource="barcodeStrings" :bordered="true" :scroll="{ y: 300 }">
          <template #renderItem="{ item }">
            <a-list-item>{{ item }}</a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>
    
    <div class="barcode-container">
      <div v-for="(barcode, index) in barcodes" :key="index" class="barcode-item">
        <svg :ref="el => { if (el) svgRefs[index] = el }"></svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, h, nextTick } from "vue";
import JsBarcode from 'jsbarcode';
import { useProductStore } from "~/stores/product/ProductStore.js";
import {
  BarcodeOutlined,
  PrinterOutlined,
} from "@ant-design/icons-vue";

const selectedBarcodeType = ref('serialNumber');
const barcodeStrings = ref([]);
const barcodeQuantity = ref(1);
const barcodes = ref([]);
const svgRefs = ref([]);

const productStore = useProductStore();

const props = defineProps({
  variant_obj: {
    type: Object,
    required: true,
  },
});

const variant = ref(props.variant_obj);

watch(variant, updateBarcodeStrings);
watch([selectedBarcodeType, barcodeQuantity], updateBarcodeStrings);

function updateBarcodeStrings() {
  if (variant.value) {
    switch (selectedBarcodeType.value) {
      case 'serialNumber':
        barcodeStrings.value = variant.value.variant.serialNumbers?.map(sn => sn.serialNumber) || [];
        break;
      case 'productCode':
        barcodeStrings.value = Array(barcodeQuantity.value).fill(variant.value.variant.code);
        break;
      case 'sku':
        barcodeStrings.value = Array(barcodeQuantity.value).fill(variant.value.variant.sku);
        break;
      case 'partNumber':
        barcodeStrings.value = Array(barcodeQuantity.value).fill(variant.value.variant.partNumber);
        break;
      default:
        barcodeStrings.value = [];
    }
  }
}

function generateBarcodes() {
  barcodes.value = barcodeStrings.value.map(str => ({ value: str }));
  svgRefs.value = new Array(barcodes.value.length);
  
  // Use nextTick to ensure the SVG elements are rendered
  nextTick(() => {
    barcodes.value.forEach((barcode, index) => {
      if (svgRefs.value[index]) {
        JsBarcode(svgRefs.value[index], barcode.value, {
          format: "CODE128",
          xmlDocument: document,
          width: 2,
          height: 80,
          displayValue: true,
          margin: 10,
        });
      }
    });
  });
}

function printBarcodes() {
  const printWindow = window.open('', );
  printWindow.document.write('<html><head><title>Print Barcodes</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    @page { size: 90mm 29mm; margin: 0; }
    body { margin: 0; padding: 0; }
    .barcode-item { 
      page-break-after: always; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 29mm; 
      padding: 0mm;
    }
    svg { 
      max-width: 86mm; 
      max-height: 25mm; 
      width: auto; 
      height: auto; 
    }
  `);
  printWindow.document.write('</style></head><body>');

  svgRefs.value.forEach((svgRef) => {
    if (svgRef) {
      const barcodeDiv = printWindow.document.createElement('div');
      barcodeDiv.className = 'barcode-item';
      const svgClone = svgRef.cloneNode(true);
      barcodeDiv.appendChild(svgClone);
      printWindow.document.body.appendChild(barcodeDiv);
    }
  });

  printWindow.document.write('</body></html>');
  printWindow.document.close();

  printWindow.onload = function() {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

onMounted(() => {
  updateBarcodeStrings();
});

</script>

<style scoped>
.barcode-print-container {
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

.content-container {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.options-card, .preview-card {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.barcode-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.barcode-item {
  margin-bottom: 16px;
  padding: 8px;
}

.barcode-item svg {
  max-width: 100%;
  height: auto;
}
</style>