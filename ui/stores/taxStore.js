import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useTaxStore = defineStore('tax', {
    state: () => ({
        taxes: [],
        tax: null,
        error: null,
        loading: false,
    }),

    getters: {
        TaxById: (state) => (id) => {
            const tax = state.taxes.find(tax => tax.id === id);
            if (!tax) {
                console.warn(`Tax with id ${id} not found`);
            }
            return tax;
        },
    },

    actions: {
        async fetchTaxes() {
            await this.performApiCall('GET', '/api/taxes', null, (data) => {
                this.taxes = data.data.value; // Access the data from the API response
            }, 'Failed to fetch taxes');
        },

        async fetchTaxById(id) {
            await this.performApiCall('GET', `/api/taxes/${id}`, null, (data) => {
                this.tax = data.data.value; // Access the data from the API response
            }, `Failed to fetch tax with ID: ${id}`);
        },

        async fetchTaxByProduct(id) {
            await this.performApiCall('GET', `/api/taxes/product/${id}`, null, (data) => {
                return data.data.value; // Access the data from the API response
            }, `Failed to fetch tax by product with ID: ${id}`);
        },

        async createTax(taxData) {
            await this.performApiCall('POST', '/api/taxes', taxData, (data) => {
                console.log('Tax created:', data);
                this.handleTaxCreation(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, 'Failed to create tax');
        },

        async updateTax(id, taxData) {
            await this.performApiCall('PUT', `/api/taxes/${id}`, taxData, (data,error) => {
                console.log('Tax updated:', error);
                this.handleTaxUpdate(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, `Failed to update tax with ID: ${id}`);
        },

        async deleteTax(id) {
            await this.performApiCall('DELETE', `/api/taxes/${id}`, null, (data) => {
                this.handleTaxDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message); // Access the message from the API response
                }
            }, `Failed to delete tax with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateTax(tax) {
            this.handleTaxUpdate(tax);
        },

        socketCreateTax(tax) {
            this.handleTaxCreation(tax);
        },

        socketDeleteTax(id) {
            this.handleTaxDeletion(id);
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

            console.log('API Call:', { method, endpoint, body, apiUrl }); // Log for debugging

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method,
                    body,
                    credentials: 'include',
                    headers: {
                        'x-socket-id': socketId,
                    },
                });

                console.log('API Response:',  error); // Log for debugging

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

        handleTaxUpdate(tax) {
            if (tax && tax.id) {
                const index = this.taxes.findIndex(tax => tax.id === tax.id);
                if (index !== -1) {
                    this.taxes.splice(index, 1, tax); // Replace the existing tax with the updated one
                } else {
                    console.warn('Tax not found for update:', tax);
                }
            } else {
                console.warn('Invalid tax data received for update:', tax);
            }
        },

        handleTaxCreation(tax) {
            if (tax && tax.id && !this.taxes.some(tax => tax.id === tax.id)) {
                this.taxes.push(tax);
            } else {
                console.warn('Invalid tax data received for creation or duplicate found:', tax);
            }
        },

        handleTaxDeletion(id) {
            const taxId = parseInt(id, 10);
            if (!isNaN(taxId)) {
                const originalTaxesLength = this.taxes.length;
                this.taxes = this.taxes.filter(tax => tax.id !== taxId);
                if (this.taxes.length < originalTaxesLength) {
                    console.log('Tax Deleted via Socket');
                } else {
                    console.warn('Tax ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid tax ID received for deletion:', id);
            }
        },
    },
});