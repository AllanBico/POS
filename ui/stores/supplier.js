// stores/supplier.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
export const useSupplierStore = defineStore('supplier', {
    state: () => ({
        suppliers: [],
    }),
    getters: {
        SupplierById: (state) => (id) => state.suppliers.find(supplier => supplier.id === id) || null,
    },
    actions: {
        async fetchSuppliers() {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/suppliers`);
            if (error.value) throw error.value;
            this.suppliers = data.value;
        },
        async createSupplier(supplier) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/suppliers`, {
                method: 'POST',
                body: supplier,
            });
            if (error.value) throw error.value;
            this.suppliers.push(data.value);
            $toast.success('Supplier Created')
        },
        async updateSupplier(id, supplier) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/suppliers/${id}`, {
                method: 'PUT',
                body: supplier,
            });
            if (error.value) throw error.value;
            const index = this.suppliers.findIndex(s => s.id === id);
            if (index !== -1) this.suppliers.splice(index, 1, data.value);
            $toast.success('Supplier Created')
        },
        async deleteSupplier(id) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { error } = await useFetch(`${config.public.baseURL}/api/suppliers/${id}`, {
                method: 'DELETE',
            });
            if (error.value) throw error.value;
            this.suppliers = this.suppliers.filter(s => s.id !== id);
            $toast.warning('Supplier Created')
        },
        // Socket event handlers
        async socketUpdateSupplier(supplier) {
            const index = this.suppliers.findIndex(obj => obj.id === supplier.id);
            if (index !== -1) this.suppliers[index] = supplier;
        },
        async socketCreateSupplier(supplier) {
            const exists = this.suppliers.some(obj => obj.id === supplier.id);
            // Only add the supplier if it doesn't already exist
            if (!exists) {
                this.suppliers.push(supplier);
            }
        },
        async socketDeleteSupplier(id) {
            const index = this.suppliers.findIndex(supplier => supplier.id === id);
            if (index !== -1) this.suppliers.splice(index, 1);
        },
    },
});
