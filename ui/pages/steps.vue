<template>
  <div>
    <a-steps :current="current" :items="items"></a-steps>
    <div class="steps-content">
      <component :is="steps[current].component" />
    </div>
    <div class="steps-action">
      <a-button v-if="current < steps.length - 1" type="primary" @click="next">Next</a-button>
      <a-button v-if="current == steps.length - 1" type="primary" @click="complete">Done</a-button>
      <a-button v-if="current > 0" style="margin-left: 8px" @click="prev">Previous</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BrandAddModal from "~/components/brands/brandAddModal.vue";
import UnitsAddModal from "~/components/units/unitsAddModal.vue";
import SupplierAddModal from "~/components/Suppliers/SupplierAddModal.vue";

const current = ref(0);

const next = () => {
  current.value++;
};
const prev = () => {
  current.value--;
};
const complete = () => {
  console.log("Processing complete!");
};

const steps = [
  {
    title: 'First',
    component: BrandAddModal,
  },
  {
    title: 'Second',
    component: UnitsAddModal,
  },
  {
    title: 'Last',
    component: SupplierAddModal,
  },
];

const items = steps.map(item => ({
  key: item.title,
  title: item.title,
}));
</script>

<style scoped>
.steps-content {
  margin-top: 16px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 200px;
  text-align: center;
  padding-top: 80px;
}

.steps-action {
  margin-top: 24px;
}

[data-theme='dark'] .steps-content {
  background-color: #2f2f2f;
  border: 1px dashed #404040;
}
</style>
