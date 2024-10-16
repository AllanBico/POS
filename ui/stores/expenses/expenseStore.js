import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';
import { useFetch } from '#app';

export const useExpenseStore = defineStore('expense', {
    state: () => ({
        expenses: [],
        expense: null,
        error: null,
        loading: false,
    }),

    getters: {
        ExpenseById: (state) => (id) => {
            const expense = state.expenses.find(exp => exp.id === id);
            if (!expense) {
                console.warn(`Expense with id ${id} not found`);
            }
            return expense;
        },
    },

    actions: {
        async fetchExpenses() {
            await this.performApiCall('GET', '/api/expenses', null, (data) => {
                this.expenses = data.data.value;
            }, 'Failed to fetch expenses');
        },

        async fetchExpense(id) {
            await this.performApiCall('GET', `/api/expenses/${id}`, null, (data) => {
                this.expense = data.data.value;
            }, `Failed to fetch expense with ID: ${id}`);
        },

        async createExpense(expense) {
            await this.performApiCall('POST', '/api/expenses', expense, (data) => {
                this.handleExpenseCreation(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, 'Failed to create expense');
        },

        async updateExpense(id, expense) {
            await this.performApiCall('PUT', `/api/expenses/${id}`, expense, (data) => {
                this.handleExpenseUpdate(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update expense with ID: ${id}`);
        },

        async deleteExpense(id) {
            await this.performApiCall('DELETE', `/api/expenses/${id}`, null, (data) => {
                this.handleExpenseDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message);
                }
            }, `Failed to delete expense with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateExpense(expense) {
            this.handleExpenseUpdate(expense);
        },

        socketCreateExpense(expense) {
            this.handleExpenseCreation(expense);
        },

        socketDeleteExpense(id) {
            this.handleExpenseDeletion(id);
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

                console.log('API Response:',  error);

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

        handleExpenseUpdate(expense) {
            if (expense && expense.id) {
                const index = this.expenses.findIndex(exp => exp.id === expense.id);
                if (index !== -1) {
                    this.expenses.splice(index, 1, expense);
                } else {
                    console.warn('Expense not found for update:', expense);
                }
            } else {
                console.warn('Invalid expense data received for update:', expense);
            }
        },

        handleExpenseCreation(expense) {
            if (expense && expense.id && !this.expenses.some(exp => exp.id === expense.id)) {
                this.expenses.push(expense);
            } else {
                console.warn('Invalid expense data received for creation or duplicate found:', expense);
            }
        },

        handleExpenseDeletion(id) {
            const expenseId = parseInt(id, 10);
            if (!isNaN(expenseId)) {
                const originalExpensesLength = this.expenses.length;
                this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
                if (this.expenses.length < originalExpensesLength) {
                    console.log('Expense Deleted via Socket');
                } else {
                    console.warn('Expense ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid expense ID received for deletion:', id);
            }
        },
    },
});