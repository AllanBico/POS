// stores/SerialNumberStore.js

import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useSerialNumberStore = defineStore('serialNumber', {
    state: () => ({
        serialNumbers: [],
        loading: false,
        error: null,
    }),

    actions: {
        // Fetch all serial numbers by variantId
        async fetchSerialNumbers() {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/serial-numbers`;
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                console.log("data.value",data.value)
                if (error) {
                    this.error = error;
                }
                this.serialNumbers = data.value;
            } catch (err) {
                console.error(err);
                this.error = 'Failed to fetch serial numbers';
            } finally {
                this.loading = false;
            }
        },async fetchSerialNumbersByVariantId(variantId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/serial-numbers/variant/${variantId}`;
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error) {
                    this.error = error;
                } else {
                    this.serialNumber = data.value;
                }
            } catch (err) {
                console.error(err);
                this.error = 'Failed to fetch serial numbers';
            } finally {
                this.loading = false;
            }
        },

        // Fetch a single serial number by ID
        async fetchSerialNumberById(serialId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/serial-numbers/${serialId}`;
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error) {
                    this.error = error;
                } else {
                    return data.value; // Return the specific serial number
                }
            } catch (err) {
                console.error(err);
                this.error = 'Failed to fetch serial number';
            } finally {
                this.loading = false;
            }
        },

        // Create a new serial number
        async createSerialNumber(payload) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/serial-numbers`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (error) {
                    this.error = error;
                } else {
                    this.serialNumbers.push(data.value); // Add the new serial number to the state
                }
            } catch (err) {
                console.error(err);
                this.error = 'Failed to create serial number';
            } finally {
                this.loading = false;
            }
        },

        // Update an existing serial number
        async updateSerialNumber(serialId, payload) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/serial-numbers/${serialId}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (error) {
                    this.error = error;
                } else {
                    // Update the state with the new data
                    const index = this.serialNumbers.findIndex(s => s.id === serialId);
                    if (index !== -1) {
                        this.serialNumbers[index] = data.value;
                    }
                }
            } catch (err) {
                console.error(err);
                this.error = 'Failed to update serial number';
            } finally {
                this.loading = false;
            }
        },

        // Delete a serial number
        async deleteSerialNumber(serialId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/serial-numbers/${serialId}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error) {
                    this.error = error;
                } else {
                    // Remove the deleted serial number from the state
                    this.serialNumbers = this.serialNumbers.filter(s => s.id !== serialId);
                }
            } catch (err) {
                console.error(err);
                this.error = 'Failed to delete serial number';
            } finally {
                this.loading = false;
            }
        }
    },

    getters: {
        getSerialNumbers: (state) => state.serialNumbers,
        getSerialNumberById: (state) => (id) => state.serialNumbers.find(serial => serial.id === id),
    },
});
