// stores/WarrantyStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp } from '#app';

export const useWarrantyStore = defineStore('warranty', {
    state: () => ({
        warranties: [],
        warranty: null,
        error: null,
        loading: false,
    }),
    getters: {
        warrantyById: (state) => (id) => {
            const warranty = state.warranties.find(warranty => warranty.id === id);
            if (!warranty) {
                console.warn(`Warranty with id ${id} not found`);
            }
            return warranty || null;
        },
    },
    actions: {
        setLoading(isLoading) {
            this.loading = isLoading;
        },

        async performApiCall(method, endpoint, body = null) {
            this.setLoading(true);
            this.error = null;
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}${endpoint}`, {
                method,
                body,
                credentials: 'include',
            });

            if (error.value) {
                console.error(`Failed to perform API call: ${error.value}`);
                this.error = error.value;
                useNuxtApp().$toast.error(error.value.message || 'An error occurred');
                throw error.value;
            }
            return data.value;
        },

        async fetchWarranties() {
            this.warranties = await this.performApiCall('GET', '/api/warranties');
        },

        async fetchWarranty(id) {
            this.warranty = await this.performApiCall('GET', `/api/warranties/${id}`);
        },

        async createWarranty(warranty) {
            const createdWarranty = await this.performApiCall('POST', '/api/warranties', warranty);
            this.warranties.push(createdWarranty);
        },

        async updateWarranty(id, warranty) {
            const updatedWarranty = await this.performApiCall('PUT', `/api/warranties/${id}`, warranty);
            const index = this.warranties.findIndex(w => w.id === id);
            if (index !== -1) this.warranties[index] = updatedWarranty;
        },

        async deleteWarranty(id) {
            await this.performApiCall('DELETE', `/api/warranties/${id}`);
            this.warranties = this.warranties.filter(w => w.id !== id);
        },

        // Socket event handlers
        socketUpdateWarranty(warranty) {
            const index = this.warranties.findIndex(obj => obj.id === warranty.id);
            if (index !== -1) {
                this.warranties[index] = { ...this.warranties[index], ...warranty };
            } else {
                console.warn('Warranty not found for update:', warranty);
            }
        },

        socketCreateWarranty(warranty) {
            const exists = this.warranties.some(obj => obj.id === warranty.id);
            if (!exists) {
                this.warranties.push(warranty);
            } else {
                console.warn('Duplicate warranty data received for creation:', warranty);
            }
        },

        socketDeleteWarranty(id) {
            const index = this.warranties.findIndex(warranty => warranty.id === id);
            if (index !== -1) {
                this.warranties.splice(index, 1);
            } else {
                console.warn('Warranty ID not found for deletion:', id);
            }
        },
    },
});
