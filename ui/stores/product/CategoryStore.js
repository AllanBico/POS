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
            console.log("store cat",id)
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
                this.categories = data;
            }, 'Failed to fetch categories');
        },

        async fetchCategory(id) {
            await this.performApiCall('GET', `/api/categories/${id}`, null, (data) => {
                this.category = data;
            }, `Failed to fetch category with ID: ${id}`);
        },

        async createCategory(category) {
            await this.performApiCall('POST', '/api/categories', category, (data) => {
                this.categories.push(data);
                useNuxtApp().$toast.success('Category Created');
            }, 'Failed to create category');
        },

        async updateCategory(id, category) {
            await this.performApiCall('PUT', `/api/categories/${id}`, category, (data) => {
                const index = this.categories.findIndex(cat => cat.id === id);
                if (index !== -1) this.categories[index] = data;
                useNuxtApp().$toast.success('Category Updated');
            }, `Failed to update category with ID: ${id}`);
        },

        async deleteCategory(id) {
            await this.performApiCall('DELETE', `/api/categories/${id}`, null, () => {
                this.categories = this.categories.filter(cat => cat.id !== id);
                useNuxtApp().$toast.warning('Category Deleted');
            }, `Failed to delete category with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateCategory(category) {
            if (category && category.id) {
                const index = this.categories.findIndex(cat => cat.id === category.id);
                if (index !== -1) {
                    this.categories[index] = { ...this.categories[index], ...category };
                } else {
                    console.warn('Category not found for update:', category);
                }
            } else {
                console.warn('Invalid category data received for update:', category);
            }
        },

        socketCreateCategory(category) {
            if (category && category.id && !this.categories.some(cat => cat.id === category.id)) {
                this.categories.push(category);
            } else {
                console.warn('Invalid category data received for creation or duplicate found:', category);
            }
        },

        socketDeleteCategory(id) {
            const categoryId = parseInt(id, 10);
            if (!isNaN(categoryId)) {
                const initialLength = this.categories.length;
                this.categories = this.categories.filter(category => category.id !== categoryId);
                if (this.categories.length < initialLength) {
                    console.log('Category Deleted via Socket');
                } else {
                    console.warn('Category ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid category ID received for deletion:', id);
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