import { defineStore } from 'pinia';
import { useFetch } from '#app';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useExpenseCategoryStore = defineStore('expenseCategory', {
    state: () => ({
        expenseCategories: [],
        expenseCategory: null,
        error: null,
        loading: false,
    }),

    getters: {
        ExpenseCategoryById: (state) => (id) => {
            const category = state.expenseCategories.find(cat => cat.id === id);
            if (!category) {
                console.warn(`Expense category with id ${id} not found`);
            }
            return category;
        },
    },

    actions: {
        async fetchExpenseCategories() {
            await this.performApiCall('GET', '/api/expense-categories', null, (data) => {
                this.expenseCategories = data.data.value; // Access the data from the API response
            }, 'Failed to fetch expense categories');
        },

        async fetchExpenseCategory(id) {
            await this.performApiCall('GET', `/api/expense-categories/${id}`, null, (data) => {
                this.expenseCategory = data.data.value; // Access the data from the API response
            }, `Failed to fetch expense category with ID: ${id}`);
        },

        async createExpenseCategory(expenseCategory) {
            await this.performApiCall('POST', '/api/expense-categories', expenseCategory, (data) => {
                console.log('Expense Category created:', data);
                this.handleExpenseCategoryCreation(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, 'Failed to create expense category');
        },

        async updateExpenseCategory(id, expenseCategory) {
            await this.performApiCall('PUT', `/api/expense-categories/${id}`, expenseCategory, (data,error) => {
                console.log('Expense Category updated:', error);
                this.handleExpenseCategoryUpdate(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, `Failed to update expense category with ID: ${id}`);
        },

        async deleteExpenseCategory(id) {
            await this.performApiCall('DELETE', `/api/expense-categories/${id}`, null, (data) => {
                this.handleExpenseCategoryDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message); // Access the message from the API response
                }
            }, `Failed to delete expense category with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateExpenseCategory(expenseCategory) {
            this.handleExpenseCategoryUpdate(expenseCategory);
        },

        socketCreateExpenseCategory(expenseCategory) {
            this.handleExpenseCategoryCreation(expenseCategory);
        },

        socketDeleteExpenseCategory(id) {
            this.handleExpenseCategoryDeletion(id);
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

        handleExpenseCategoryUpdate(expenseCategory) {
            if (expenseCategory && expenseCategory.id) {
                const index = this.expenseCategories.findIndex(cat => cat.id === expenseCategory.id);
                if (index !== -1) {
                    this.expenseCategories.splice(index, 1, expenseCategory); // Replace the existing category with the updated one
                } else {
                    console.warn('Expense Category not found for update:', expenseCategory);
                }
            } else {
                console.warn('Invalid expense category data received for update:', expenseCategory);
            }
        },

        handleExpenseCategoryCreation(expenseCategory) {
            if (expenseCategory && expenseCategory.id && !this.expenseCategories.some(cat => cat.id === expenseCategory.id)) {
                this.expenseCategories.push(expenseCategory);
            } else {
                console.warn('Invalid expense category data received for creation or duplicate found:', expenseCategory);
            }
        },

        handleExpenseCategoryDeletion(id) {
            const expenseCategoryId = parseInt(id, 10);
            if (!isNaN(expenseCategoryId)) {
                const originalExpenseCategoriesLength = this.expenseCategories.length;
                this.expenseCategories = this.expenseCategories.filter(category => category.id !== expenseCategoryId);
                if (this.expenseCategories.length < originalExpenseCategoriesLength) {
                    console.log('Expense Category Deleted via Socket');
                } else {
                    console.warn('Expense Category ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid expense category ID received for deletion:', id);
            }
        },
    },
});