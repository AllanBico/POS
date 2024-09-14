import { defineStore } from 'pinia';
import { useFetch } from '#app'; // Assuming Nuxt 3

export const useStockMovementStore = defineStore('stockMovement', {
    state: () => ({
        stockMovements: [],
        stockMovement: null,
        error: null,
    }),
    actions: {
        async fetchStockMovements() {
            try {
                const { data, error } = await useFetch('/api/stockMovement');
                if (error.value) throw new Error(error.value);

                this.stockMovements = data.value;
            } catch (err) {
                this.error = err.message;
            }
        },

        async fetchStockMovementById(id) {
            try {
                const { data, error } = await useFetch(`/api/stockMovement/${id}`);
                if (error.value) throw new Error(error.value);

                this.stockMovement = data.value;
            } catch (err) {
                this.error = err.message;
            }
        },

        async createStockMovement(payload) {
            try {
                const { data, error } = await useFetch('/api/stockMovement', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                if (error.value) throw new Error(error.value);

                this.stockMovements.push(data.value);
            } catch (err) {
                this.error = err.message;
            }
        },

        async updateStockMovement(id, payload) {
            try {
                const { data, error } = await useFetch(`/api/stockMovement/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
                if (error.value) throw new Error(error.value);

                const index = this.stockMovements.findIndex((sm) => sm.id === id);
                if (index !== -1) this.stockMovements[index] = data.value;
            } catch (err) {
                this.error = err.message;
            }
        },

        async deleteStockMovement(id) {
            try {
                const { error } = await useFetch(`/api/stockMovement/${id}`, {
                    method: 'DELETE',
                });
                if (error.value) throw new Error(error.value);

                this.stockMovements = this.stockMovements.filter((sm) => sm.id !== id);
            } catch (err) {
                this.error = err.message;
            }
        },
    },
});
