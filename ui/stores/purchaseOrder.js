import { defineStore } from 'pinia';
import { useRuntimeConfig, useFetch } from '#app';

export const usePurchaseOrderStore = defineStore('purchaseOrder', {
    state: () => ({
        purchaseOrders: [],
        purchaseOrder: null,
        error: null,
        loading: false,
    }),
    getters: {
        purchaseOrderId: (state) => (id) => state.purchaseOrders.find(order => order.id === id) || null,
    },
    actions: {
        setLoading(value) {
            this.loading = value;
        },

        async fetchPurchaseOrders() {
            const config = useRuntimeConfig();
            this.setLoading(true);
            try {
                const apiUrl = `${config.public.baseURL}/api/purchase-orders`;
                const { data, error } = await useFetch(apiUrl);
                if (error.value) {
                    this.error = error.value.data?.message || error.value.message;
                    throw error.value;
                }
                this.purchaseOrders = data.value;
                this.setLoading(false);
            } catch (error) {
                this.error = error?.message || 'Unknown error';
                this.setLoading(false);
            }
        },

        async fetchPurchaseOrderById(id) {
            const config = useRuntimeConfig();
            this.setLoading(true);
            try {
                const apiUrl = `${config.public.baseURL}/api/purchase-orders/${id}`;
                const { data, error } = await useFetch(apiUrl);
                if (error.value) {
                    this.error = error.value.data?.message || error.value.message;
                    throw error.value;
                }
                this.purchaseOrder = data.value;
                this.setLoading(false);
            } catch (error) {
                this.error = error?.message || 'Unknown error';
                this.setLoading(false);
            }
        },

        async createPurchaseOrder(payload) {
            const config = useRuntimeConfig();
            this.setLoading(true);
            try {
                const apiUrl = `${config.public.baseURL}/api/purchase-orders`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: payload,
                });
                if (error.value) {
                    this.error = error.value.data?.message || error.value.message;
                    console.log("this.error",error)
                    throw error.value;
                }
                this.purchaseOrders.push(data.value);
                this.setLoading(false);
            } catch (error) {
                this.error = error?.message || 'Unknown error';
                this.setLoading(false);
            }
        },

        async updatePurchaseOrder(id, payload) {
            const config = useRuntimeConfig();
            this.setLoading(true);
            try {
                const apiUrl = `${config.public.baseURL}/api/purchase-orders/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: payload,
                });
                if (error.value) {
                    this.error = error.value.data?.message || error.value.message;
                    throw error.value;
                }
                const index = this.purchaseOrders.findIndex(order => order.id === id);
                if (index !== -1) {
                    this.purchaseOrders[index] = data.value;
                }
                this.setLoading(false);
            } catch (error) {
                this.error = error?.message || 'Unknown error';
                this.setLoading(false);
            }
        },

        async deletePurchaseOrder(id) {
            const config = useRuntimeConfig();
            this.setLoading(true);
            try {
                const apiUrl = `${config.public.baseURL}/api/purchase-orders/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });
                if (error.value) {
                    this.error = error.value.data?.message || error.value.message;
                    throw error.value;
                }
                this.purchaseOrders = this.purchaseOrders.filter(order => order.id !== id);
                this.setLoading(false);
            } catch (error) {
                this.error = error?.message || 'Unknown error';
                this.setLoading(false);
            }
        },

        async deleteLineItem(purchaseOrderId, lineItemId) {
            const config = useRuntimeConfig();
            this.setLoading(true);
            try {
                const apiUrl = `${config.public.baseURL}/api/purchase-orders/${purchaseOrderId}/line-items/${lineItemId}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });
                if (error.value) {
                    this.error = error.value.data?.message || error.value.message;
                    throw error.value;
                }
                const orderIndex = this.purchaseOrders.findIndex(order => order.id === purchaseOrderId);
                if (orderIndex !== -1) {
                    this.purchaseOrders[orderIndex].lineItems = this.purchaseOrders[orderIndex].lineItems.filter(item => item.id !== lineItemId);
                }
                this.setLoading(false);
            } catch (error) {
                this.error = error?.message || 'Unknown error';
                this.setLoading(false);
            }
        },
    },
});