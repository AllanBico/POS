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
            const { data, error } = await useFetch(`${config.public.baseURL}/api/suppliers`, {credentials: 'include'});
            if (error.value) {
                console.error('Error fetching suppliers:', error.value);
                throw error.value;
            }
            this.suppliers = data.value;
        },
        async createSupplier(supplier) {
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/suppliers`, {
                method: 'POST',
                body: supplier,
                credentials: 'include',
            });
            if (error.value) {
                console.error('Error creating supplier:', error.value);
                throw error.value;
            }
            const newSupplier = data.value;
            if (!newSupplier || !newSupplier.id) {
                console.error('Error creating supplier: invalid response');
                throw new Error('Invalid response from server');
            }
            this.suppliers.push(newSupplier);
            $toast.success('Supplier Created');
        },
        async updateSupplier(id, supplier) {
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/suppliers/${id}`, {
                method: 'PUT',
                body: supplier,
                credentials: 'include',
            });
            if (error.value) {
                console.error('Error updating supplier:', error.value);
                throw error.value;
            }
            const updatedSupplier = data.value;
            if (!updatedSupplier || !updatedSupplier.id) {
                console.error('Error updating supplier: invalid response');
                throw new Error('Invalid response from server');
            }
            const index = this.suppliers.findIndex(s => s.id === id);
            if (index !== -1) {
                this.suppliers.splice(index, 1, updatedSupplier);
            }
            $toast.success('Supplier Updated');
        },
        async deleteSupplier(id) {
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const { error } = await useFetch(`${config.public.baseURL}/api/suppliers/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (error.value) {
                console.error('Error deleting supplier:', error.value);
                throw error.value;
            }
            this.suppliers = this.suppliers.filter(s => s.id !== id);
            $toast.warning('Supplier Deleted');
        },
        // Socket event handlers
        async socketUpdateSupplier(supplier) {
            const index = this.suppliers.findIndex(obj => obj.id === supplier.id);
            if (index !== -1) {
                this.suppliers[index] = supplier;
            }
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