// stores/warranty.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#imports';

export const useWarrantyStore = defineStore('warranty', {
    state: () => ({
        warranties: [],
        warranty: null,
    }),
    getters: {
        warrantyById: (state) => (id) => state.warranties.find(warranty => warranty.id === id) || null,
    },
    actions: {
        async fetchWarranties() {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warranties`);
            if (error.value) throw error.value;
            this.warranties = data.value;
        },

        async fetchWarranty(id) {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warranties/${id}`);
            if (error.value) throw error.value;
            this.warranty = data.value;
        },

        async createWarranty(warranty) {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warranties`, {
                method: 'POST',
                body: warranty,
            });
            if (error.value) throw error.value;
            this.warranties.push(data.value);
        },

        async updateWarranty(id, warranty) {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warranties/${id}`, {
                method: 'PUT',
                body: warranty,
            });
            if (error.value) throw error.value;
            const index = this.warranties.findIndex(w => w.id === id);
            this.warranties[index] = data.value;
        },

        async deleteWarranty(id) {
            const config = useRuntimeConfig();
            const { error } = await useFetch(`${config.public.baseURL}/api/warranties/${id}`, {
                method: 'DELETE',
            });
            if (error.value) throw error.value;
            this.warranties = this.warranties.filter(w => w.id !== id);
        }
    },
});
