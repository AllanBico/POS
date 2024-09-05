// stores/category.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
import { ref } from 'vue';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        category: null,
        error: null,
        loading: false, // Loading state to track ongoing requests
    }),
    getters: {
        CategoryById: (state) => (id) => state.categories.find(category => category.id === id) || null,
    },
    actions: {
        async fetchCategories() {
            this.setLoading(true); // Start loading
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/categories`;

            try {
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.categories = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch categories');
            } finally {
                this.setLoading(false); // Stop loading
            }
        },

        async fetchCategory(id) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/categories/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, { method: 'GET' });
                if (error.value) throw error.value;
                this.category = data.value;
            } catch (error) {
                this.handleError(error, `Failed to fetch category with ID: ${id}`);
            } finally {
                this.setLoading(false);
            }
        },

        async createCategory(category) {
            this.setLoading(true);
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/categories`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: category,
                });
                if (error.value) throw error.value;
                this.categories.push(data.value);
                $toast.success('Category Created');
            } catch (error) {
                $toast.error('Failed to create category')
            } finally {
                this.setLoading(false);
            }
        },
        async updateCategory(id, category) {
            this.setLoading(true);
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/categories/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: category,
                });
                if (error.value) throw error.value;
                const index = this.categories.findIndex(cat => cat.id === category.id);
                if (index !== -1) this.categories[index] = category;
                $toast.success('Category Updated');
            } catch (error) {
                this.handleError(error, `Failed to update category with ID: ${id}`);
            } finally {
                this.setLoading(false);
            }
        },
        async deleteCategory(id) {
            this.setLoading(true);
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/categories/${id}`;

            try {
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });
                if (error.value) throw error.value;
                this.categories = this.categories.filter(cat => cat.id !== id);
                $toast.warning('Category Deleted');
            } catch (error) {
                this.handleError(error, `Failed to delete category with ID: ${id}`);
            } finally {
                this.setLoading(false);
            }
        },
        // Socket event handlers
        async socketUpdateCategory(category) {
            const index = this.categories.findIndex(cat => cat.id === category.id);
            if (index !== -1) this.categories[index] = category;
        },
        async socketCreateCategory(category) {
            const exists = this.categories.some(cat => cat.id === category.id);
            // Only add the category if it doesn't already exist
            if (!exists) {
                this.categories.push(category);
            }
        },
        async socketDeleteCategory(id) {
            const index = this.categories.findIndex(category => category.id === id);
            if (index !== -1) this.categories.splice(index, 1);
        },
        // Utility functions
        setLoading(isLoading) {
            this.loading = isLoading;
        },
    },
});
