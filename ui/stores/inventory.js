// stores/inventory.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
        inventories: [],
        inventory: null,
        error: null,
        loading: false, // Loading state to track ongoing requests
    }),
    getters: {
        InventoryById: (state) => (id) => state.inventories.find(inventory => inventory.id === id) || null,
    },
    actions: {
        async fetchInventories() {
            this.setLoading(true); // Start loading
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/inventories`;

            try {
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.inventories = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch inventories');
            } finally {
                this.setLoading(false); // Stop loading
            }
        },

        async fetchInventory(id) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/inventories/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.inventory = data.value;
            } catch (error) {
                this.handleError(error, `Failed to fetch inventory with ID: ${id}`);
            } finally {
                this.setLoading(false);
            }
        },

        async createInventory(inventory) {
            this.setLoading(true);
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/inventories`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: inventory,
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.inventories.push(data.value);
                $toast.success('Inventory Created');
            } catch (error) {
                $toast.error('Failed to create inventory');
            } finally {
                this.setLoading(false);
            }
        },

        async updateInventory(id, inventory) {
            this.setLoading(true);
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/inventories/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: inventory,
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                const index = this.inventories.findIndex(inv => inv.id === inventory.id);
                if (index !== -1) this.inventories[index] = inventory;
                $toast.success('Inventory Updated');
            } catch (error) {
                this.handleError(error, `Failed to update inventory with ID: ${id}`);
            } finally {
                this.setLoading(false);
            }
        },

        async deleteInventory(id) {
            this.setLoading(true);
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/inventories/${id}`;

            try {
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.inventories = this.inventories.filter(inv => inv.id !== id);
                $toast.warning('Inventory Deleted');
            } catch (error) {
                this.handleError(error, `Failed to delete inventory with ID: ${id}`);
            } finally {
                this.setLoading(false);
            }
        },

        // Socket event handlers
        async socketUpdateInventory(inventory) {
            const index = this.inventories.findIndex(inv => inv.id === inventory.id);
            if (index !== -1) this.inventories[index] = inventory;
        },
        async socketCreateInventory(inventory) {
            const exists = this.inventories.some(inv => inv.id === inventory.id);
            if (!exists) {
                this.inventories.push(inventory);
            }
        },
        async socketDeleteInventory(id) {
            const index = this.inventories.findIndex(inventory => inventory.id === id);
            if (index !== -1) this.inventories.splice(index, 1);
        },

        // Utility functions
        setLoading(isLoading) {
            this.loading = isLoading;
        },
    },
});