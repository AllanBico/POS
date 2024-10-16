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
            return warranty;
        },
    },

    actions: {
        async fetchWarranties() {
            await this.performApiCall('GET', '/api/warranties', null, (data) => {
                this.warranties = data;
            }, 'Failed to fetch warranties');
        },

        async fetchWarranty(id) {
            await this.performApiCall('GET', `/api/warranties/${id}`, null, (data) => {
                this.warranty = data;
            }, `Failed to fetch warranty with ID: ${id}`);
        },

        async createWarranty(warranty) {
            await this.performApiCall('POST', '/api/warranties', warranty, (data) => {
                this.warranties.push(data);
                useNuxtApp().$toast.success('Warranty Created');
            }, 'Failed to create warranty');
        },

        async updateWarranty(id, warranty) {
            await this.performApiCall('PUT', `/api/warranties/${id}`, warranty, (data) => {
                const index = this.warranties.findIndex(w => w.id === id);
                if (index !== -1) this.warranties[index] = data;
                useNuxtApp().$toast.success('Warranty Updated');
            }, `Failed to update warranty with ID: ${id}`);
        },

        async deleteWarranty(id) {
            await this.performApiCall('DELETE', `/api/warranties/${id}`, null, () => {
                this.warranties = this.warranties.filter(w => w.id !== id);
                useNuxtApp().$toast.warning('Warranty Deleted');
            }, `Failed to delete warranty with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateWarranty(warranty) {
            if (warranty && warranty.id) {
                const index = this.warranties.findIndex(w => w.id === warranty.id);
                if (index !== -1) {
                    this.warranties[index] = { ...this.warranties[index], ...warranty };
                } else {
                    console.warn('Warranty not found for update:', warranty);
                }
            } else {
                console.warn('Invalid warranty data received for update:', warranty);
            }
        },

        socketCreateWarranty(warranty) {
            if (warranty && warranty.id && !this.warranties.some(w => w.id === warranty.id)) {
                this.warranties.push(warranty);
            } else {
                console.warn('Invalid warranty data received for creation or duplicate found:', warranty);
            }
        },

        socketDeleteWarranty(id) {
            const warrantyId = parseInt(id, 10);
            if (!isNaN(warrantyId)) {
                const initialLength = this.warranties.length;
                this.warranties = this.warranties.filter(warranty => warranty.id !== warrantyId);
                if (this.warranties.length < initialLength) {
                    console.log('Warranty Deleted via Socket');
                } else {
                    console.warn('Warranty ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid warranty ID received for deletion:', id);
            }
        },

        // Utility functions
        setLoading(isLoading) {
            this.loading = isLoading;
        },

        async performApiCall(method, endpoint, body, onSuccess, errorMessage) {
            this.setLoading(true);
            this.error = null;
            const config = useRuntimeConfig();
            const socketId = useState('socketId').value;
            const apiUrl = `${config.public.baseURL}${endpoint}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method,
                    body,
                    credentials: 'include',
                    headers: {
                        'x-socket-id': socketId,
                    },
                });

                if (error.value) {
                    const errorData = error.value.data;
                    if (errorData && errorData.error) {
                        throw new Error(errorData.error);
                    } else if (error.value.status === 400) {
                        throw new Error('Invalid input. Please check your data and try again.');
                    } else if (error.value.status === 404) {
                        throw new Error('The requested resource was not found.');
                    } else if (error.value.status === 500) {
                        throw new Error('An internal server error occurred. Please try again later.');
                    } else {
                        throw new Error(errorMessage);
                    }
                }
                onSuccess(data.value.data);
            } catch (error) {
                console.error(errorMessage, error);
                this.error = error.message;
                useNuxtApp().$toast.error(error.message || errorMessage);
            } finally {
                this.setLoading(false);
            }
        },
    },
});