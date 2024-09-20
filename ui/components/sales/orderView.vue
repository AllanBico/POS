<template>
    <div>
        <!-- Order Summary -->
        <a-descriptions
                title="Order Details"
                bordered
                :column="1"
        >
            <a-descriptions-item label="Customer">
                {{ orderDetails.customer ? orderDetails.customer.name : 'None' }}
            </a-descriptions-item>

            <a-descriptions-item label="Order Total">
                {{ orderDetails.total | currency }}
            </a-descriptions-item>

            <a-descriptions-item label="Order Date">
                {{ orderDetails.createdAt | formatDate }}
            </a-descriptions-item>

            <a-descriptions-item label="Status">
                {{ orderDetails.status }}
            </a-descriptions-item>
        </a-descriptions>

        <!-- Line Items -->
        <a-descriptions
                title="Line Items"
                bordered
                :column="1"
        >
            <template v-for="(item, index) in orderDetails.lineItems" :key="index">
                <a-descriptions-item :label="'Product ' + (index + 1)">
                    {{ item.variant.Product.name }} (SKU: {{ item.variant.sku }})
                </a-descriptions-item>

                <a-descriptions-item label="Quantity">
                    {{ item.quantity }}
                </a-descriptions-item>

                <a-descriptions-item label="Unit Price">
                    {{ item.price | currency }}
                </a-descriptions-item>

                <a-descriptions-item label="Total Price">
                    {{ item.totalPrice | currency }}
                </a-descriptions-item>
            </template>
        </a-descriptions>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSalesOrderStore } from '~/stores/sales/SalesOrderStore.js';
import { useRoute } from 'vue-router';

// Props
const props = defineProps({
    orderId: {
        type: Number,
        required: true,
    },
});

// Order data
const orderDetails = ref({});

// Fetch the order details when the component is mounted
onMounted(async () => {
    await fetchOrderDetails();
});

// Fetch the order details by orderId
const fetchOrderDetails = async () => {
    try {
        const salesOrderStore = useSalesOrderStore();
        orderDetails.value = await salesOrderStore.fetchOrderById(props.orderId);
        console.log("orderDetails.value",orderDetails.value)
    } catch (error) {
        console.error('Error fetching order:', error);
    }
};
</script>

