import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
import { useFetch } from '#app';
import { useNuxtApp } from '#app';

export const useExpenseStore = defineStore('expense', {
    state: () => ({
        expenses: [],
        error: null,
    }),
    getters: {
        ExpenseById: (state) => (id) => {
            const expense = state.expenses.find(exp => exp.id === id);
            if (!expense) {
                console.error(`Expense with id ${id} not found`);
                return null;
            }
            return expense;
        },
    },
    actions: {
        async fetchExpenses() {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/expenses`;
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.expenses = data.value;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching expenses:', error);
            }
        },
        async createExpense(expense) {
            const { $toast } = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/expenses`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: expense,
                });
                if (error.value) throw error.value;
                this.expenses.push(data.value);
                $toast.success('Expense Created');
            } catch (error) {
                this.error = error.message;
                console.error('Error adding expense:', error);
                $toast.error('Error creating expense');
            }
        },
        async updateExpense(id, updatedData) {
            const { $toast } = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/expenses/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: updatedData,
                });
                if (error.value) throw error.value;
                const index = this.expenses.findIndex(exp => exp.id === id);
                if (index !== -1) {
                    this.expenses[index] = data.value;
                }
                $toast.success('Expense Updated');
            } catch (error) {
                this.error = error.message;
                console.error('Error updating expense:', error);
                $toast.error('Error updating expense');
            }
        },
        async deleteExpense(id) {
            const { $toast } = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/expenses/${id}`;
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });
                if (error.value) throw error.value;
                this.expenses = this.expenses.filter(exp => exp.id !== id);
                $toast.warning('Expense Deleted');
            } catch (error) {
                this.error = error.message;
                console.error('Error deleting expense:', error);
                $toast.error('Error deleting expense');
            }
        },
    },
});