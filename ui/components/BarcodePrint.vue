<template>
  <div>
    <label for="barcode-type">Choose the type for generating the barcode:</label>
    <select v-model="selectedBarcodeType" id="barcode-type">
      <option value="serialNumber">Serial Number</option>
      <option value="productCode">Product Code</option>
      <option value="sku">SKU</option>
      <option value="partNumber">Part Number</option>
    </select>

    <!-- Show input for quantity only if barcode type is not serialNumber -->
    <div v-if="selectedBarcodeType !== 'serialNumber'">
      <label for="barcode-quantity">How many barcodes to generate?</label>
      <input type="number" v-model="barcodeQuantity" id="barcode-quantity" min="1" />
    </div>

    <div v-if="barcodeStrings.length">
      <p><strong>Selected Values:</strong></p>
      <ul>
        <li v-for="(str, index) in barcodeStrings" :key="index">{{ str }}</li>
      </ul>
    </div>

    <button @click="renderBarcodes">Generate Barcodes</button>
    <button @click="printBarcodes">Print Barcodes</button>

    <div ref="barcodeContainer"></div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import { useBarcode } from '@/composables/useBarcode';
import { useProductStore } from "~/stores/product/ProductStore.js";

const barcodeContainer = ref(null);
const selectedBarcodeType = ref('serialNumber');
const barcodeStrings = ref([]);
const barcodeQuantity = ref(1);  // Input for number of barcodes to generate

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
        // Map through the serialNumbers array to extract the serialNumber field
        barcodeStrings.value = variant.value.variant.serialNumbers?.map(sn => sn.serialNumber) || [];
        break;
      case 'productCode':
        // Generate barcodeQuantity number of product codes
        barcodeStrings.value = Array(barcodeQuantity.value).fill(variant.value.variant.code);
        break;
      case 'sku':
        // Generate barcodeQuantity number of SKUs
        barcodeStrings.value = Array(barcodeQuantity.value).fill(variant.value.variant.sku);
        break;
      case 'partNumber':
        // Generate barcodeQuantity number of part numbers
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
    // Clear previous barcodes
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
/* Add your styles if needed */
</style>