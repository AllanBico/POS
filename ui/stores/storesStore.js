import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useStoreStore = defineStore('store', {
    state: () => ({
        stores: [],
        error: null,
        loading: false,
    }),

    getters: {
        StoreById: (state) => (id) => {
            const store = state.stores.find(store => store.id === id);
            if (!store) {
                console.warn(`Store with id ${id} not found`);
            }
            return store;
        },
    },

    actions: {
        async fetchStores() {
            await this.performApiCall('GET', '/api/stores', null, (data) => {
                console.log('Stores fetched:', data);
                this.stores = data.data.value; // Access the data from the API response
            }, 'Failed to fetch stores');
        },

        async createStore(store) {
            await this.performApiCall('POST', '/api/stores', store, (data) => {
                console.log('Store created:', data);
                this.handleStoreCreation(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, 'Failed to create store');
        },

        async updateStore(id, store) {
            await this.performApiCall('PUT', `/api/stores/${id}`, store, (data,error) => {
                console.log('Store updated:', error);
                this.handleStoreUpdate(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, `Failed to update store with ID: ${id}`);
        },

        async deleteStore(id) {
            await this.performApiCall('DELETE', `/api/stores/${id}`, null, (data) => {
                this.handleStoreDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message); // Access the message from the API response
                }
            }, `Failed to delete store with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateStore(store) {
            this.handleStoreUpdate(store);
        },

        socketCreateStore(store) {
            this.handleStoreCreation(store);
        },

        socketDeleteStore(id) {
            this.handleStoreDeletion(id);
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

                console.log('API Response:',  error,data); // Log for debugging

                if (error.value) {
                    // Handle network errors
                    if (error.value.status === 400) {
                        throw new Error('Invalid input. Please check your data and try again.');
                    } else if (error.value.status === 404) {
                        throw new Error('The requested resource was not found.');
                    } else if (error.value.status === 500) {
                        throw new Error('An internal server error occurred. Please try again later.');
                    } else if (error.value.data.message) {
                        throw new Error(error.value.data.message);
                    } else {
                        throw new Error(errorMessage);
                    }
                }

                // Check if data is available before accessing it
                if (data.value && data.value.data) {
                    onSuccess(data.value);
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

        handleStoreUpdate(store) {
            if (store && store.id) {
                const index = this.stores.findIndex(st => st.id === store.id);
                if (index !== -1) {
                    this.stores.splice(index, 1, store); // Replace the existing store with the updated one
                } else {
                    console.warn('Store not found for update:', store);
                }
            } else {
                console.warn('Invalid store data received for update:', store);
            }
        },

        handleStoreCreation(store) {
            if (store && store.id && !this.stores.some(st => st.id === store.id)) {
                this.stores.push(store);
            } else {
                console.warn('Invalid store data received for creation or duplicate found:', store);
            }
        },

        handleStoreDeletion(id) {
            const storeId = parseInt(id, 10);
            if (!isNaN(storeId)) {
                const originalStoresLength = this.stores.length;
                this.stores = this.stores.filter(store => store.id !== storeId);
                if (this.stores.length < originalStoresLength) {
                    console.log('Store Deleted via Socket');
                } else {
                    console.warn('Store ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid store ID received for deletion:', id);
            }
        },
    },
});