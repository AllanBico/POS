<template>
  <div>
    <input ref="barcodeInput" type="text" style="opacity: 0; position: absolute;" />
    <div>
      Scanned Data: {{ scannedData }}
    </div>
    <div v-if="isBarcode">Detected as Barcode</div>
    <div v-else>Detected as Keyboard Input</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const scannedData = ref('');
const isBarcode = ref(false);
const barcodeInput = ref(null);
let lastKeyTime = Date.now();
const BARCODE_END_CHAR = 'Enter'; // Adjust if your scanner uses a different end character
const BARCODE_THRESHOLD_MS = 50; // Time threshold to differentiate between barcode and keyboard
const BARCODE_LENGTH = 12; // Adjust based on expected barcode length
const BUFFER_TIME_MS = 300; // Buffer time to confirm barcode scan

const handleKeyDown = (event) => {
  const currentTime = Date.now();
  const timeDiff = currentTime - lastKeyTime;

  // Append character to scannedData
  if (event.key !== BARCODE_END_CHAR) {
    scannedData.value += event.key;
    isBarcode.value = timeDiff < BARCODE_THRESHOLD_MS && scannedData.value.length >= BARCODE_LENGTH;
  } else {
    // End of barcode scan
    isBarcode.value = true;
    setTimeout(() => {
      console.log('Scanned Data:', scannedData.value);
      scannedData.value = '';
      isBarcode.value = false;
    }, BUFFER_TIME_MS);
  }

  lastKeyTime = currentTime;
};

onMounted(() => {
  // Focus the hidden input to capture barcode input
  barcodeInput.value.focus();

  // Add event listener
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  // Remove event listener
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
