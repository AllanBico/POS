import { defineStore } from 'pinia';

export const useWarehouseStore = defineStore('warehouse', {
    state: () => ({
        warehouses: [],
    }),
    getters: {
        WarehouseById: (state) => (id) => state.warehouses.find(warehouse => warehouse.id === id) || null,
    },
    actions: {
        async fetchWarehouses() {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warehouses`);
            if (error.value) throw error.value;
            this.warehouses = data.value;
        },
        async createWarehouse(warehouse) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warehouses`, {
                method: 'POST',
                body: warehouse,
            });
            if (error.value) throw error.value;
            this.warehouses.push(data.value);
            $toast.success('Warehouse Created')
        },
        async updateWarehouse(id, warehouse) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/warehouses/${id}`, {
                method: 'PUT',
                body: warehouse,
            });
            if (error.value) throw error.value;
            this.warehouses = this.warehouses.map(w => (w.id === id ? data.value : w));
            $toast.success('Warehouse Updated')
        },
        async deleteWarehouse(id) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { error } = await useFetch(`${config.public.baseURL}/api/warehouses/${id}`, {
                method: 'DELETE',
            });
            if (error.value) throw error.value;
            this.warehouses = this.warehouses.filter(w => w.id !== id);
            $toast.warning('Warehouse Deleted')
        }
    }
});
