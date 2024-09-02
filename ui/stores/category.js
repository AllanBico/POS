// stores/category.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        category: null,
        error: null,
    }),
    getters: {
        CategoryById: (state) => (id) => state.categories.find(category => category.id === id) || null,
    },
    actions: {
        async fetchCategories() {
            const config = useRuntimeConfig();
            const apiUrl = config.public.baseURL + `/api/categories`;
            const { data, error } = await useFetch(apiUrl);
            if (error.value) throw error.value;
            this.categories = data.value;
        },
        async fetchCategory(id) {
            const config = useRuntimeConfig();
            const apiUrl = config.public.baseURL + `/api/categories/${id}`;
            const { data, error } = await useFetch(apiUrl, {
                method: 'GET',
            });

            if (error.value) throw error.value;
            this.category = data.value;
        },
        async createCategory(category) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const apiUrl = config.public.baseURL + `/api/categories`;
            const { data, error } = await useFetch(apiUrl, {
                method: 'POST',
                body: category,
            });
            if (error.value) {

                throw error.value

            }
            this.categories.push(data.value);
            $toast.success('Category Created')
        },
        async updateCategory(id, category) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const apiUrl = config.public.baseURL + `/api/categories/${id}`;
            const { data, error } = await useFetch(apiUrl, {
                method: 'PUT',
                body: category,
            });
            if (error.value) throw error.value;
            const index = this.categories.findIndex(cat => cat.id === id);
            if (index !== -1) this.categories[index] = data.value;
            $toast.success('Category Updated')
        },
        async deleteCategory(id) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const apiUrl = config.public.baseURL + `/api/categories/${id}`;
            const { error } = await useFetch(apiUrl, {
                method: 'DELETE',
            });
            if (error.value) throw error.value;
            this.categories = this.categories.filter(cat => cat.id !== id);
            $toast.warning('Category Deleted')
        },
    },
});
