import { defineStore } from 'pinia';
import { useFetch } from '#app';
import { useRuntimeConfig } from '#app';
export const useExpenseCategoryStore = defineStore('expenseCategory', {
    state: () => ({
        expenseCategories: [],
        error: null,
    }),
    getters: {
        ExpenseCategoryById: (state) => (id) => {
            const category = state.expenseCategories.find(cat => cat.id === id);
            if (!category) {
                console.error(`Expense category with id ${id} not found`);
                return null;
            }
            return category;
        },
    },
    actions: {
        async fetchExpenseCategories() {
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/expense-categories`;
            const { data, error } = await useFetch(apiUrl, {
                credentials: 'include',
            });
            if (error.value) {
                this.error = error.value.message;
                console.error('Error fetching expense categories:', error.value);
            } else {
                this.expenseCategories = data.value;
            }
        },
        async createExpenseCategory(expenseCategory) {
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/expense-categories`;
            const { data, error } = await useFetch(apiUrl, {
                method: 'POST',
                body: expenseCategory,
                credentials: 'include',
            });
            if (error.value) {
                this.error = error.value.message;
                console.error('Error adding expense category:', error.value);
                $toast.error('Error creating expense category');
            } else {
                this.expenseCategories.push(data.value);
                $toast.success('Expense Category Created');
            }
        },
        async updateExpenseCategory(id, updatedData) {
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/expense-categories/${id}`;
            const { data, error } = await useFetch(apiUrl, {
                method: 'PUT',
                body: updatedData,
                credentials: 'include',
            });
            if (error.value) {
                this.error = error.value.message;
                console.error('Error updating expense category:', error.value);
                $toast.error('Error updating expense category');
            } else {
                const index = this.expenseCategories.findIndex(cat => cat.id === id);
                if (index !== -1) {
                    this.expenseCategories[index] = data.value;
                }
                $toast.success('Expense Category Updated');
            }
        },
        async deleteExpenseCategory(id) {
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/expense-categories/${id}`;
            const { error } = await useFetch(apiUrl, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (error.value) {
                this.error = error.value.message;
                console.error('Error deleting expense category:', error.value);
                $toast.error('Error deleting expense category');
            } else {
                this.expenseCategories = this.expenseCategories.filter(cat => cat.id !== id);
                $toast.warning('Expense Category Deleted');
            }
        },
    },
});