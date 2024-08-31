import { defineStore } from 'pinia';

export const useUnitStore = defineStore('unit', {
    state: () => ({
        units: [],
        loading: false,
        error: null,
    }),
    getters: {
        UnitById: (state) => (id) => state.units.find(unit => unit.id === id) || null,
    },
    actions: {
        // Fetch all units
        async fetchUnits() {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/units`;
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.units = data.value;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Create a new unit
        async createUnit(unit) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/units`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: unit,
                });
                if (error.value) throw error.value;
                this.units.push(data.value);
            } catch (err) {
                this.error = err.message;
            }
        },

        // Update an existing unit
        async updateUnit(id, updatedUnit) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/units/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: updatedUnit,
                });
                if (error.value) throw error.value;

                const index = this.units.findIndex((unit) => unit.id === id);
                if (index !== -1) {
                    this.units[index] = data.value;
                }
            } catch (err) {
                this.error = err.message;
            }
        },

        // Delete a unit
        async deleteUnit(id) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/units/${id}`;
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });
                if (error.value) throw error.value;

                this.units = this.units.filter((unit) => unit.id !== id);
            } catch (err) {
                this.error = err.message;
            }
        },
    },
});
