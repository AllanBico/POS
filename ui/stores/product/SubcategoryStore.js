// stores/SubcategoryStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useSubcategoryStore = defineStore('subcategory', {
    state: () => ({
        subcategories: [],
        subcategory: null,
        error: null,
        loading: false,
    }),

    getters: {
        SubcategoryById: (state) => (id) => {
            const subcategory = state.subcategories.find(subcategory => subcategory.id === id);
            if (!subcategory) {
                console.warn(`Subcategory with id ${id} not found`);
            }
            return subcategory;
        },
    },

    actions: {
        async fetchSubcategories() {
            await this.performApiCall('GET', '/api/sub-categories', null, (data) => {
                this.subcategories = data.data.value;
            }, 'Failed to fetch subcategories');
        },

        async fetchSubcategory(id) {
            await this.performApiCall('GET', `/api/sub-categories/${id}`, null, (data) => {
                this.subcategory = data.data.value;
            }, `Failed to fetch subcategory with ID: ${id}`);
        },

        async createSubcategory(subcategory) {
            await this.performApiCall('POST', '/api/sub-categories', subcategory, (data) => {
                console.log('Subcategory created:', data);
                this.handleSubcategoryCreation(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, 'Failed to create subcategory');
        },

        async updateSubcategory(id, subcategory) {
            await this.performApiCall('PUT', `/api/sub-categories/${id}`, subcategory, (data) => {
                console.log('Subcategory updated:', data);
                this.handleSubcategoryUpdate(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update subcategory with ID: ${id}`);
        },

        async deleteSubcategory(id) {
            await this.performApiCall('DELETE', `/api/sub-categories/${id}`, null, (data) => {
                this.handleSubcategoryDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message);
                }
            }, `Failed to delete subcategory with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateSubcategory(subcategory) {
            this.handleSubcategoryUpdate(subcategory);
        },

        socketCreateSubcategory(subcategory) {
            this.handleSubcategoryCreation(subcategory);
        },

        socketDeleteSubcategory(id) {
            this.handleSubcategoryDeletion(id);
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

            console.log('API Call:', { method, endpoint, body, apiUrl });

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method,
                    body,
                    credentials: 'include',
                    headers: {
                        'x-socket-id': socketId,
                    },
                });

                console.log('API Response:', error);

                if (error.value) {
                    // Handle network errors
                    if (error.value.status === 400) {
                        throw new Error('Invalid input. Please check your data and try again.');
                    } else if (error.value.status === 404) {
                        throw new Error('The requested resource was not found.');
                    } else if (error.value.status === 500) {
                        throw new Error('An internal server error occurred. Please try again later.');
                    } else if (error.value.data.message) {
                        this.error = error.value.data.message
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

        handleSubcategoryUpdate(subcategory) {
            if (subcategory && subcategory.id) {
                const index = this.subcategories.findIndex(sub => sub.id === subcategory.id);
                if (index !== -1) {
                    this.subcategories.splice(index, 1, subcategory);
                } else {
                    console.warn('Subcategory not found for update:', subcategory);
                }
            } else {
                console.warn('Invalid subcategory data received for update:', subcategory);
            }
        },

        handleSubcategoryCreation(subcategory) {
            if (subcategory && subcategory.id && !this.subcategories.some(sub => sub.id === subcategory.id)) {
                this.subcategories.push(subcategory);
            } else {
                console.warn('Invalid subcategory data received for creation or duplicate found:', subcategory);
            }
        },

        handleSubcategoryDeletion(id) {
            const subcategoryId = parseInt(id, 10);
            if (!isNaN(subcategoryId)) {
                const originalSubcategoriesLength = this.subcategories.length;
                this.subcategories = this.subcategories.filter(subcategory => subcategory.id !== subcategoryId);
                if (this.subcategories.length < originalSubcategoriesLength) {
                    console.log('Subcategory Deleted via Socket');
                } else {
                    console.warn('Subcategory ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid subcategory ID received for deletion:', id);
            }
        },
    },
});