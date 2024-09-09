import { defineStore } from 'pinia';

export const useUnitStore = defineStore('unit', {
    state: () => ({
        units: [],
        loading: false,
        error: null,
    }),
    getters: {
        UnitById: (state) => (id) => {
            const unit = state.units.find((unit) => unit.id === id);
            if (!unit) return null;
            return unit;
        },
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
                if (error.value) {
                    console.error('Error fetching units:', error.value);
                    throw error.value;
                }
                this.units = data.value || [];
            } catch (err) {
                this.error = err.message || 'An unexpected error occurred';
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
                if (error.value) {
                    console.error('Error creating unit:', error.value);
                    throw error.value;
                }
                this.units.push(data.value);
            } catch (err) {
                this.error = err.message || 'An unexpected error occurred';
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
                if (error.value) {
                    console.error('Error updating unit:', error.value);
                    throw error.value;
                }

                const index = this.units.findIndex((unit) => unit.id === id);
                if (index !== -1) {
                    this.units[index] = data.value;
                }
            } catch (err) {
                this.error = err.message || 'An unexpected error occurred';
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
                if (error.value) {
                    console.error('Error deleting unit:', error.value);
                    throw error.value;
                }

                this.units = this.units.filter((unit) => unit.id !== id);
            } catch (err) {
                this.error = err.message || 'An unexpected error occurred';
            }
        },
        // Socket event handlers
        async socketUpdateUnit(unit) {
            const index = this.units.findIndex((obj) => obj.id === unit.id);
            if (index !== -1) this.units[index] = unit;
        },
        async socketCreateUnit(unit) {
            const exists = this.units.some((obj) => obj.id === unit.id);
            // Only add the unit if it doesn't already exist
            if (!exists) {
                this.units.push(unit);
            }
        },
        async socketDeleteUnit(id) {
            const index = this.units.findIndex((unit) => unit.id === id);
            if (index !== -1) this.units.splice(index, 1);
        },
    },
});