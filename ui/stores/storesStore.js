import { defineStore } from 'pinia';

export const useStoreStore = defineStore('store', {
    state: () => ({
        stores: [],
    }),
    getters: {
        StoreById: (state) => (id) => state.stores.find(store => store.id === id) || null,
    },
    actions: {
        async fetchStores() {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/stores`, {
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.stores = data.value;
        },
        async createStore(store) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/stores`, {
                method: 'POST',
                body: store,
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.stores.push(data.value);
            $toast.success('Store Created')
        },
        async updateStore(id, store) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/stores/${id}`, {
                method: 'PUT',
                body: store,
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.stores = this.stores.map(s => (s.id === id ? data.value : s));
            $toast.success('Store Updated')
        },
        async deleteStore(id) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { error } = await useFetch(`${config.public.baseURL}/api/stores/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.stores = this.stores.filter(s => s.id !== id);
            $toast.warning('Store Deleted')
        }
    }
});