import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useUnitStore = defineStore('unit', {
    state: () => ({
        units: [],
        loading: false,
        error: null,
    }),

    getters: {
        UnitById: (state) => (id) => {
            const unit = state.units.find(unit => unit.id === id);
            if (!unit) {
                console.warn(`Unit with id ${id} not found`);
            }
            return unit;
        },
    },

    actions: {
        async fetchUnits() {
            await this.performApiCall('GET', '/api/units', null, (data) => {
                console.log('Fetched units:', data);
                this.units = data.data.value; // Access the data from the API response
            }, 'Failed to fetch units');
        },

        async createUnit(unit) {
            await this.performApiCall('POST', '/api/units', unit, (data) => {
                this.handleUnitCreation(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, 'Failed to create unit');
        },

        async updateUnit(id, updatedUnit) {
            await this.performApiCall('PUT', `/api/units/${id}`, updatedUnit, (data) => {
                this.handleUnitUpdate(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, `Failed to update unit with ID: ${id}`);
        },

        async deleteUnit(id) {
            await this.performApiCall('DELETE', `/api/units/${id}`, null, (data) => {
                this.handleUnitDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message); // Access the message from the API response
                }
            }, `Failed to delete unit with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateUnit(unit) {
            this.handleUnitUpdate(unit);
        },

        socketCreateUnit(unit) {
            this.handleUnitCreation(unit);
        },

        socketDeleteUnit(id) {
            this.handleUnitDeletion(id);
        },

        // Utility functions
        setLoading(isLoading) {
            this.loading = isLoading;
        },

        async performApiCall(method, endpoint, body, onSuccess, errorMessage) {
            this.setLoading(true);
            this.error = null;
            const config = useRuntimeConfig();
            const socketId = useState('socketId').value;
            const apiUrl = `${config.public.baseURL}${endpoint}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method,
                    body,
                    credentials: 'include',
                    headers: {
                        'x-socket-id': socketId,
                    },
                });

                if (error.value) {
                    // Handle network errors
                    if (error.value.status === 400) {
                        throw new Error('Invalid input. Please check your data and try again.');
                    } else if (error.value.status === 404) {
                        throw new Error('The requested resource was not found.');
                    } else if (error.value.status === 500) {
                        throw new Error('An internal server error occurred. Please try again later.');
                    } else if (error.value.data.message) {
                        throw new Error(error.value.data.message);
                    } else {
                        throw new Error(errorMessage);
                    }
                }

                // Check if data is available before accessing it
                if (data.value && data.value.data) {
                    onSuccess(data.value);
                } else if (data.value && data.value.message) {
                    // Handle cases where only a message is returned (e.g., DELETE)
                    onSuccess(data.value);
                } else {
                    // Handle case where data is missing
                    console.error('No data received from API:', data.value);
                    this.error = 'No data received from API';
                    useNuxtApp().$toast.error('No data received from API');
                }
            } catch (error) {
                console.error(errorMessage, error);
                this.error = error.message;
                useNuxtApp().$toast.error(error.message || errorMessage);
            } finally {
                this.setLoading(false);
            }
        },

        handleUnitUpdate(unit) {
            if (unit && unit.id) {
                const index = this.units.findIndex(cat => cat.id === unit.id);
                if (index !== -1) {
                    this.units.splice(index, 1, unit); // Replace the existing unit with the updated one
                } else {
                    console.warn('Unit not found for update:', unit);
                }
            } else {
                console.warn('Invalid unit data received for update:', unit);
            }
        },

        handleUnitCreation(unit) {
            if (unit && unit.id && !this.units.some(cat => cat.id === unit.id)) {
                this.units.push(unit);
            } else {
                console.warn('Invalid unit data received for creation or duplicate found:', unit);
            }
        },

        handleUnitDeletion(id) {
            const unitId = parseInt(id, 10);
            if (!isNaN(unitId)) {
                const originalUnitsLength = this.units.length;
                this.units = this.units.filter(unit => unit.id !== unitId);
                if (this.units.length < originalUnitsLength) {
                    console.log('Unit Deleted via Socket');
                } else {
                    console.warn('Unit ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid unit ID received for deletion:', id);
            }
        },
    },
});