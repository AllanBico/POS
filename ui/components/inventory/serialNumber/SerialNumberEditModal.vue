<template>
  <a-modal
      :visible="true"
      title="Edit Serial Number"
      ok-text="Save"
      cancel-text="Cancel"
      @ok="handleSubmit"
      @cancel="handleCancel"
  >
    <a-form
        :model="form"
        label-col="{ span: 6 }"
        wrapper-col="{ span: 18 }"
        :rules="rules"
        ref="formRef"
    >
      <!-- Serial Number Field -->
      <a-form-item
          label="Serial Number"
          name="serialNumber"
          :rules="[ { required: true, message: 'Please input the serial number' } ]"
      >
        <a-input v-model:value="form.serialNumber" placeholder="Enter serial number" />
      </a-form-item>

      <!-- Status Field -->
      <a-form-item
          label="Status"
          name="status"
          :rules="[ { required: true, message: 'Please select status' } ]"
      >
        <a-select v-model:value="form.status" placeholder="Select status">
          <a-select-option value="available">Available</a-select-option>
          <a-select-option value="unavailable">Unavailable</a-select-option>
          <a-select-option value="sold">Sold</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSerialNumberStore } from '~/stores/SerialNumberStore';

// Props to receive the serial number ID
const props = defineProps({
  serial_id: {
    type: Number,
    required: true,
  },
});

const formRef = ref(null);
const serialNumberStore = useSerialNumberStore();
const form = ref({
  serialNumber: '',
  status: '',
});

// Validation rules
const rules = {
  serialNumber: [{ required: true, message: 'Serial Number is required' }],
  status: [{ required: true, message: 'Status is required' }],
};

// Fetch serial number data on modal open
onMounted(async () => {
  if (props.serial_id) {
    const serialNumberData = await serialNumberStore.fetchSerialNumberById(parseInt(props.serial_id));
    if (serialNumberData) {
      form.value.serialNumber = serialNumberData.serialNumber;
      form.value.status = serialNumberData.status;
    }
  }
});

// Handle modal submission
const handleSubmit = () => {
  formRef.value.validateFields(async (err) => {
    if (!err) {
      const payload = {
        serialNumber: form.value.serialNumber,
        status: form.value.status,
      };
      await serialNumberStore.updateSerialNumber(props.serial_id, payload);
      // Emit event on successful update
      emit('submit-success');
    }
  });
};

// Handle modal cancel action
const handleCancel = () => {
  emit('submit-success'); // Close modal
};
</script>

<style scoped>
/* Add custom styles here if necessary */
</style>
