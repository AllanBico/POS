<template>
  <div>
    <input v-model="barcodeString" placeholder="Enter a string" />
    <button @click="renderBarcode">Generate Barcode</button>
    <button @click="printBarcodebtn">Print Barcode</button>

    <!-- The canvas or SVG element where the barcode will be rendered -->
    <canvas ref="barcodeCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBarcode } from '@/composables/useBarcode';

const barcodeString = ref('');
const barcodeCanvas = ref(null);
const { generateBarcode, printBarcode } = useBarcode();

const renderBarcode = () => {
  if (barcodeCanvas.value && barcodeString.value) {
    generateBarcode(barcodeCanvas.value, barcodeString.value, {
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
    });
  } else {
    console.warn("Please enter a string and ensure the canvas is available.");
  }
};

const printBarcodebtn = () => {
  if (barcodeCanvas.value) {
    printBarcode(barcodeCanvas.value); // Print the barcode
  } else {
    console.warn("No barcode available to print.");
  }
};
</script>
