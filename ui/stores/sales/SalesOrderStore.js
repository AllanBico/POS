// stores/SalesOrderStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useSalesOrderStore = defineStore('salesOrder', {
    state: () => ({
        orders: [],
        order: null,
        lineItems: [],
        error: null,
        loading: false,
    }),
    getters: {
        OrderById: (state) => (id) => state.orders.find(order => order.id === id) || null,
        LineItemsByOrderId: (state) => (orderId) => state.lineItems.filter(item => item.salesOrderId === orderId),
    },
    actions: {
        // Set loading state
        setLoading(loading) {
            this.loading = loading;
        },

        // Error handling function
        handleError(error, message = 'An error occurred') {
            this.error = error;
            console.log("message",message)
            //TODO: Add error handling
        },

        // Fetch all sales orders
        async fetchOrders() {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/orders`;

            try {
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.orders = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch orders');
            } finally {
                this.setLoading(false);
            }
        },

        // Fetch single sales order by ID
        async fetchOrderById(id) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/orders/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.order = data.value;
                return data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch order');
            } finally {
                this.setLoading(false);
            }
        },

        // Create a new sales order
        async createOrder(orderData) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/orders`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: orderData,
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.orders.push(data.value);
            } catch (error) {
                this.handleError(error, 'Failed to create order');
            } finally {
                this.setLoading(false);
            }
        },

        // Update an existing sales order
        async updateOrder(id, updatedData) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/orders/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: updatedData,
                    credentials: 'include',
                });
                if (error.value) throw error.value;

                // Update local state with new data
                const index = this.orders.findIndex(order => order.id === id);
                if (index !== -1) {
                    this.orders[index] = data.value;
                }
            } catch (error) {
                this.handleError(error, 'Failed to update order');
            } finally {
                this.setLoading(false);
            }
        },

        // Delete a sales order
        async deleteOrder(id) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/orders/${id}`;

            try {
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error.value) throw error.value;

                // Remove from local state
                this.orders = this.orders.filter(order => order.id !== id);
            } catch (error) {
                this.handleError(error, 'Failed to delete order');
            } finally {
                this.setLoading(false);
            }
        },

        // Fetch line items by sales order ID
        async fetchLineItemsByOrderId(orderId) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/orders/items/${orderId}/`;

            try {
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.lineItems = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch line items');
            } finally {
                this.setLoading(false);
            }
        },

        // Create a new line item for a sales order
        async createLineItem(lineItemData) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/orders/items/`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: lineItemData,
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.lineItems.push(data.value);
            } catch (error) {
                this.handleError(error, 'Failed to add line item');
            } finally {
                this.setLoading(false);
            }
        },

        // Update an existing line item
        async updateLineItem(id, updatedData) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/orders/items/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: updatedData,
                    credentials: 'include',
                });
                if (error.value) throw error.value;

                // Update local state with new data
                const index = this.lineItems.findIndex(item => item.id === id);
                if (index !== -1) {
                    this.lineItems[index] = data.value;
                }
            } catch (error) {
                this.handleError(error, 'Failed to update line item');
            } finally {
                this.setLoading(false);
            }
        },

        // Delete a line item
        async deleteLineItem(id) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/orders/items/${id}`;

            try {
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error.value) throw error.value;

                // Remove from local state
                this.lineItems = this.lineItems.filter(item => item.id !== id);
            } catch (error) {
                this.handleError(error, 'Failed to delete line item');
            } finally {
                this.setLoading(false);
            }
        },
    },
});
