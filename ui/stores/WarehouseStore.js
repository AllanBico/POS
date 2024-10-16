import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useWarehouseStore = defineStore('warehouse', {
    state: () => ({
        warehouses: [],
        error: null,
        loading: false,
    }),

    getters: {
        WarehouseById: (state) => (id) => {
            const warehouse = state.warehouses.find(warehouse => warehouse.id === id);
            if (!warehouse) {
                console.warn(`Warehouse with id ${id} not found`);
            }
            return warehouse;
        },
    },

    actions: {
        async fetchWarehouses() {
            await this.performApiCall('GET', '/api/warehouses', null, (data) => {
                this.warehouses = data.data.value; // Access the data from the API response
            }, 'Failed to fetch warehouses');
        },

        async createWarehouse(warehouse) {
            await this.performApiCall('POST', '/api/warehouses', warehouse, (data) => {
                this.handleWarehouseCreation(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, 'Failed to create warehouse');
        },

        async updateWarehouse(id, warehouse) {
            await this.performApiCall('PUT', `/api/warehouses/${id}`, warehouse, (data) => {
                this.handleWarehouseUpdate(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                } 
            }, `Failed to update warehouse with ID: ${id}`);
        },

        async deleteWarehouse(id) {
            await this.performApiCall('DELETE', `/api/warehouses/${id}`, null, (data) => {
                this.handleWarehouseDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message); // Access the message from the API response
                }
            }, `Failed to delete warehouse with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateWarehouse(warehouse) {
            this.handleWarehouseUpdate(warehouse);
        },

        socketCreateWarehouse(warehouse) {
            this.handleWarehouseCreation(warehouse);
        },

        socketDeleteWarehouse(id) {
            this.handleWarehouseDeletion(id);
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

            console.log('API Call:', { method, endpoint, body, apiUrl }); // Log for debugging

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method,
                    body,
                    credentials: 'include',
                    headers: {
                        'x-socket-id': socketId,
                    },
                });

                console.log('API Response:', data,error); // Log for debugging 
                if (error.value) {
                    // Handle network errors
                    if (error.value.status === 400) {
                        throw new Error('Invalid input. Please check your data and try again.');
                    } else if (error.value.status === 404) {
                        throw new Error('The requested resource was not found.');
                    } else if (error.value.status === 500) {
                        throw new Error('An internal server error occurred. Please try again later.');
                    }else if (error.value.data.message) {
                        throw new Error(error.value.data.message);
                    }  else {
                        throw new Error(errorMessage);
                    }
                }

                // Check if data is available before accessing it
                if (data.value && data.value.data) {
                    onSuccess(data.value); // Access the data from the API response
                } else if (data.value && data.value.message) {
                    // Handle cases where only a message is returned (e.g., DELETE)
                    onSuccess(data.value);
                } else {
                    // Handle case where data is missing
                    console.error('No data received from API:', data.value);
                    this.error = 'No data received from API';
                    useNuxtApp().$toast.error('No data received from API');
                }
            } catch (error) {
                console.error(errorMessage, error);
                this.error = error.message;
                useNuxtApp().$toast.error(error.message || errorMessage);
            } finally {
                this.setLoading(false);
            }
        },

        handleWarehouseUpdate(warehouse) {
            if (warehouse && warehouse.id) {
                const index = this.warehouses.findIndex(ware => ware.id === warehouse.id);
                if (index !== -1) {
                    this.warehouses.splice(index, 1, warehouse); // Replace the existing warehouse with the updated one
                } else {
                    console.warn('Warehouse not found for update:', warehouse);
                }
            } else {
                console.warn('Invalid warehouse data received for update:', warehouse);
            }
        },

        handleWarehouseCreation(warehouse) {
            if (warehouse && warehouse.id && !this.warehouses.some(ware => ware.id === warehouse.id)) {
                this.warehouses.push(warehouse);
            } else {
                console.warn('Invalid warehouse data received for creation or duplicate found:', warehouse);
            }
        },

        handleWarehouseDeletion(id) {
            const warehouseId = parseInt(id, 10);
            if (!isNaN(warehouseId)) {
                const originalWarehousesLength = this.warehouses.length;
                this.warehouses = this.warehouses.filter(warehouse => warehouse.id !== warehouseId);
                if (this.warehouses.length < originalWarehousesLength) {
                    console.log('Warehouse Deleted via Socket');
                } else {
                    console.warn('Warehouse ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid warehouse ID received for deletion:', id);
            }
        },
    },
});