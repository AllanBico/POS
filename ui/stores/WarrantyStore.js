// stores/WarrantyStore.js
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
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warranties`,{credentials: 'include'});
            if (error.value) throw error.value;
            this.warranties = data.value;
        },

        async fetchWarranty(id) {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warranties/${id}`,{credentials: 'include'});
            if (error.value) throw error.value;
            this.warranty = data.value;
        },

        async createWarranty(warranty) {
            console.log("store warranty",warranty)
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warranties`, {
                method: 'POST',
                body: warranty,
                credentials: 'include',
            });
            if (error.value) {
                console.log("error.value",error)
                throw error.value
            }
            this.warranties.push(data.value);
        },

        async updateWarranty(id, warranty) {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warranties/${id}`, {
                method: 'PUT',
                body: warranty,
                credentials: 'include',
            });
            if (error.value) throw error.value;
            const index = this.warranties.findIndex(w => w.id === id);
            this.warranties[index] = data.value;
        },

        async deleteWarranty(id) {
            const config = useRuntimeConfig();
            const { error } = await useFetch(`${config.public.baseURL}/api/warranties/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.warranties = this.warranties.filter(w => w.id !== id);
        },
        // Socket event handlers
        async socketUpdateWarranty(warranty) {
            const index = this.warranties.findIndex(obj => obj.id === warranty.id);
            if (index !== -1) this.warranties[index] = warranty;
        },
        async socketCreateWarranty(warranty) {
            const exists = this.warranties.some(obj => obj.id === warranty.id);
            // Only add the warranty if it doesn't already exist
            if (!exists) {
                this.warranties.push(warranty);
            }
        },
        async socketDeleteWarranty(id) {
            const index = this.warranties.findIndex(warranty => warranty.id === id);
            if (index !== -1) this.warranties.splice(index, 1);
        },
    },
});
