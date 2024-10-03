import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app'; // For environment variables in Nuxt 3

export const useDeliveryStore = defineStore('deliveryStore', {
    state: () => ({
        deliveries: [], // List of all deliveries
        delivery: null, // Single delivery for details view
        loading: false, // Loading state
        error: null,    // Error state
    }),

    actions: {
        // Fetch all deliveries
        async fetchDeliveries() {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const { data } = await useFetch(`${config.public.baseURL}/api/deliveries`,{credentials: 'include'});
                console.log("store data",data)
                this.deliveries = data;
            } catch (error) {
                console.error('Failed to fetch deliveries:', error);
                this.error = 'Failed to fetch deliveries';
            } finally {
                this.loading = false;
            }
        },

        // Fetch a single delivery by ID
        async fetchDeliveryById(deliveryId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const { data } = await useFetch(`${config.public.baseURL}/api/deliveries/${deliveryId}`,{credentials: 'include'});
                this.delivery = data;
            } catch (error) {
                console.error('Failed to fetch delivery:', error);
                this.error = 'Failed to fetch delivery';
            } finally {
                this.loading = false;
            }
        },

        // Create a new delivery
        async createDelivery(payload) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const { data } = await useFetch(`${config.public.baseURL}/api/deliveries`, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                this.deliveries.push(data.deliveryNote); // Add the new delivery to the state
                return data; // Return the created delivery data
            } catch (error) {
                console.error('Failed to create delivery:', error);
                this.error = 'Failed to create delivery';
                throw error; // Rethrow error for handling in the UI
            } finally {
                this.loading = false;
            }
        },

        // Update a delivery
        async updateDelivery(deliveryId, payload) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const { data } = await useFetch(`${config.public.baseURL}/api/deliveries/${deliveryId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                // Update the delivery in the local state
                const index = this.deliveries.findIndex(delivery => delivery.id === deliveryId);
                if (index !== -1) {
                    this.deliveries[index] = data.deliveryNote;
                }
                return data; // Return the updated delivery data
            } catch (error) {
                console.error('Failed to update delivery:', error);
                this.error = 'Failed to update delivery';
                throw error; // Rethrow error for handling in the UI
            } finally {
                this.loading = false;
            }
        },

        // Delete a delivery
        async deleteDelivery(deliveryId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                await useFetch(`${config.public.baseURL}/api/deliveries/${deliveryId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                // Remove the deleted delivery from the state
                this.deliveries = this.deliveries.filter(delivery => delivery.id !== deliveryId);
            } catch (error) {
                console.error('Failed to delete delivery:', error);
                this.error = 'Failed to delete delivery';
            } finally {
                this.loading = false;
            }
        },

        // Reset the delivery state (for cleaning up after navigation)
        resetDelivery() {
            this.delivery = null;
            this.error = null;
            this.loading = false;
        },
    },

    getters: {
        getDeliveryById: (state) => (id) => {
            return state.deliveries.find(delivery => delivery.id === id) || null;
        },
    },
});
