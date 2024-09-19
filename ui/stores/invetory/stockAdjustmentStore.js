import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useStockAdjustmentStore = defineStore('stockAdjustment', {
    state: () => ({
        stockAdjustments: [],
        stockAdjustment: null,
        error: null,
        loading: false,
    }),
    getters: {
        StockAdjustmentById: (state) => (id) => state.stockAdjustments.find(stockAdjustment => stockAdjustment.id === id) || null,
    },
    actions: {
        async fetchStockAdjustments() {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/stock-adjustments`;

            try {
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.stockAdjustments = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch stock adjustments');
            } finally {
                this.setLoading(false);
            }
        },
        async approveStockAdjustment(id) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/stock-adjustments/${id}/approve`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.stockAdjustment = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch stock adjustment');
            } finally {
                this.setLoading(false);
            }
        },
        async createStockAdjustment(payload) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/stock-adjustments`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.stockAdjustments.push(data.value);
            } catch (error) {
                this.handleError(error, 'Failed to create stock adjustment');
            } finally {
                this.setLoading(false);
            }
        },
        async updateStockAdjustment(id, payload) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/stock-adjustments/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.stockAdjustment = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to update stock adjustment');
            } finally {
                this.setLoading(false);
            }
        },
        async deleteStockAdjustment(id) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/stock-adjustments/${id}`;

            try {
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.stockAdjustments = this.stockAdjustments.filter(adjustment => adjustment.id !== id);
            } catch (error) {
                this.handleError(error, 'Failed to delete stock adjustment');
            } finally {
                this.setLoading(false);
            }
        },
        setLoading(loading) {
            this.loading = loading;
        },
        handleError(error, message) {
            console.error(message, error);
            this.error = error;
        },
    },
});
