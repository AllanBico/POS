// stores/CategoryStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        category: null,
        error: null,
        loading: false,
    }),

    getters: {
        CategoryById: (state) => (id) => {
            const category = state.categories.find(category => category.id === id);
            if (!category) {
                console.warn(`Category with id ${id} not found`);
            }
            return category;
        },
    },

    actions: {
        async fetchCategories() {
            await this.performApiCall('GET', '/api/categories', null, (data) => {
                this.categories = data.data.value; // Access the data from the API response
            }, 'Failed to fetch categories');
        },

        async fetchCategory(id) {
            await this.performApiCall('GET', `/api/categories/${id}`, null, (data) => {
                this.category = data.data.value; // Access the data from the API response
            }, `Failed to fetch category with ID: ${id}`);
        },

        async createCategory(category) {
            await this.performApiCall('POST', '/api/categories', category, (data) => {
                console.log('Category created:', data);
                this.handleCategoryCreation(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, 'Failed to create category');
        },

        async updateCategory(id, category) {
            await this.performApiCall('PUT', `/api/categories/${id}`, category, (data,error) => {
                console.log('Category updated:', error);
                this.handleCategoryUpdate(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, `Failed to update category with ID: ${id}`);
        },

        async deleteCategory(id) {
            await this.performApiCall('DELETE', `/api/categories/${id}`, null, (data) => {
                this.handleCategoryDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message); // Access the message from the API response
                }
            }, `Failed to delete category with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateCategory(category) {
            this.handleCategoryUpdate(category);
        },

        socketCreateCategory(category) {
            this.handleCategoryCreation(category);
        },

        socketDeleteCategory(id) {
            this.handleCategoryDeletion(id);
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

                console.log('API Response:',  error); // Log for debugging

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

        handleCategoryUpdate(category) {
            if (category && category.id) {
                const index = this.categories.findIndex(cat => cat.id === category.id);
                if (index !== -1) {
                    this.categories.splice(index, 1, category); // Replace the existing category with the updated one
                } else {
                    console.warn('Category not found for update:', category);
                }
            } else {
                console.warn('Invalid category data received for update:', category);
            }
        },

        handleCategoryCreation(category) {
            if (category && category.id && !this.categories.some(cat => cat.id === category.id)) {
                this.categories.push(category);
            } else {
                console.warn('Invalid category data received for creation or duplicate found:', category);
            }
        },

        handleCategoryDeletion(id) {
            const categoryId = parseInt(id, 10);
            if (!isNaN(categoryId)) {
                const originalCategoriesLength = this.categories.length;
                this.categories = this.categories.filter(category => category.id !== categoryId);
                if (this.categories.length < originalCategoriesLength) {
                    console.log('Category Deleted via Socket');
                } else {
                    console.warn('Category ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid category ID received for deletion:', id);
            }
        },
    },
});