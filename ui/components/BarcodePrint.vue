<template>
  <div class="barcode-print-container">
    <a-card class="header-card" :bordered="false">
      <a-page-header
        class="header"
        title="Barcode Generator"
        sub-title="Generate and print barcodes for your products"
      >
        <template #extra>
          <a-button type="primary" @click="renderBarcodes" :icon="h(BarcodeOutlined)">
            Generate Barcodes
          </a-button>
          <a-button @click="printBarcodes" :icon="h(PrinterOutlined)">
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
    <div ref="barcodeContainer" class="barcode-container"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, h } from "vue";
import { useBarcode } from '@/composables/useBarcode';
import { useProductStore } from "~/stores/product/ProductStore.js";
import {
  BarcodeOutlined,
  PrinterOutlined,
} from "@ant-design/icons-vue";

const barcodeContainer = ref(null);
const selectedBarcodeType = ref('serialNumber');
const barcodeStrings = ref([]);
const barcodeQuantity = ref(1);

const { generateBarcode, printBarcode } = useBarcode();
const productStore = useProductStore();

const props = defineProps({
  variant_obj: {
    type: Object,
    required: true,
  },
});

const variant = ref(props.variant_obj);

watch(variant, () => {
  updateBarcodeStrings();
});

const updateBarcodeStrings = () => {
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
};

watch([selectedBarcodeType, barcodeQuantity], updateBarcodeStrings);

const renderBarcodes = () => {
  if (barcodeContainer.value && barcodeStrings.value.length) {
    barcodeContainer.value.innerHTML = '';

    barcodeStrings.value.forEach((str, index) => {
      const canvas = document.createElement('canvas');
      canvas.id = `barcode-${index}`;
      barcodeContainer.value.appendChild(canvas);

      generateBarcode(canvas, str, {
        format: 'CODE128',
        width: 2,
        height: 100,
        displayValue: true,
      });
    });
  } else {
    console.warn("Please select a value and ensure the container is available.");
  }
};

const printBarcodes = () => {
  if (barcodeContainer.value) {
    const canvases = barcodeContainer.value.querySelectorAll('canvas');
    if (canvases.length) {
      canvases.forEach(canvas => printBarcode(canvas));
    } else {
      console.warn("No barcodes available to print.");
    }
  } else {
    console.warn("No barcode container available.");
  }
};

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

.barcode-container canvas {
  margin-bottom: 16px;
}
</style>