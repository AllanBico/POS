<script setup lang="ts">

</script>

<template>
  <a-row :gutter="16">
    <a-col :span="6">
      <a-card title="Total Sales" :hoverable="true" class="stat-card">
        <p class="stat-value">$15,000</p>
        <a-progress percent="75" status="active" />
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card title="Products in Stock" :hoverable="true" class="stat-card">
        <p class="stat-value">320</p>
        <a-progress percent="50" status="active" />
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card title="Orders Today" :hoverable="true" class="stat-card">
        <p class="stat-value">120</p>
        <a-progress percent="85" status="active" />
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card title="Pending Shipments" :hoverable="true" class="stat-card">
        <p class="stat-value">40</p>
        <a-progress percent="40" status="active" />
      </a-card>
    </a-col>
  </a-row>

  <a-row :gutter="16" class="mt-4">
    <a-col :span="12">
      <a-card title="Sales Trend" :hoverable="true" class="chart-card">
        <!-- Placeholder for sales chart -->
        <div class="chart-placeholder">Chart Here</div>
      </a-card>
    </a-col>
    <a-col :span="12">
      <a-card title="Recent Orders" :hoverable="true" class="chart-card">
        <!-- Placeholder for recent orders -->
        <div class="order-list-placeholder">Order List Here</div>
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped>
.stat-card {
  background-color: #ffffff;
}

.stat-value {
  font-size: 24px;
  color: #14122e;
  margin-bottom: 16px;
}

.chart-placeholder, .order-list-placeholder {
  height: 200px;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}
</style>