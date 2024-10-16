import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useSupplierStore = defineStore('supplier', {
    // Define the state of the store
    state: () => ({
        suppliers: [], // Array to store all suppliers
        error: null, // Store any error that occurs
        loading: false, // Flag to indicate if data is being loaded
    }),

    // Define getters for accessing and manipulating state
    getters: {
        // Getter to retrieve a supplier by its ID
        SupplierById: (state) => (id) => {
            const supplier = state.suppliers.find(supplier => supplier.id === id);
            if (!supplier) {
                console.warn(`Supplier with id ${id} not found`);
            }
            return supplier;
        },
    },

    // Define actions for interacting with the store
    actions: {
        // Action to fetch all suppliers from the API
        async fetchSuppliers() {
            await this.performApiCall('GET', '/api/suppliers', null, (data) => {
                this.suppliers = data.data.value; // Update the suppliers array with the fetched data
            }, 'Failed to fetch suppliers');
        },

        // Action to create a new supplier
        async createSupplier(supplier) {
            await this.performApiCall('POST', '/api/suppliers', supplier, (data) => {
                console.log('Supplier created:', data);
                this.handleSupplierCreation(data.data.value); // Handle the creation of the new supplier
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Display a success message if provided by the API
                }
            }, 'Failed to create supplier');
        },

        // Action to update an existing supplier
        async updateSupplier(id, supplier) {
            await this.performApiCall('PUT', `/api/suppliers/${id}`, supplier, (data,error) => {
                console.log('Supplier updated:', error);
                this.handleSupplierUpdate(data.data.value); // Handle the update of the supplier
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Display a success message if provided by the API
                }
            }, `Failed to update supplier with ID: ${id}`);
        },

        // Action to delete a supplier
        async deleteSupplier(id) {
            await this.performApiCall('DELETE', `/api/suppliers/${id}`, null, (data) => {
                this.handleSupplierDeletion(id); // Handle the deletion of the supplier
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message); // Display a warning message if provided by the API
                }
            }, `Failed to delete supplier with ID: ${id}`);
        },

        // Socket event handlers for real-time updates
        socketUpdateSupplier(supplier) {
            this.handleSupplierUpdate(supplier);
        },

        socketCreateSupplier(supplier) {
            this.handleSupplierCreation(supplier);
        },

        socketDeleteSupplier(id) {
            this.handleSupplierDeletion(id);
        },

        // Utility functions
        setLoading(isLoading) {
            this.loading = isLoading;
        },
        // Function to perform API calls
        async performApiCall(method, endpoint, body, onSuccess, errorMessage) {
            this.setLoading(true); // Set loading state to true
            this.error = null; // Reset any previous error
            const config = useRuntimeConfig(); // Get the runtime configuration
            const socketId = useState('socketId').value; // Get the socket ID
            const apiUrl = `${config.public.baseURL}${endpoint}`; // Construct the API URL

            console.log('API Call:', { method, endpoint, body, apiUrl }); // Log the API call for debugging

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method, // HTTP method (GET, POST, PUT, DELETE)
                    body, // Request body
                    credentials: 'include', // Include credentials (cookies)
                    headers: {
                        'x-socket-id': socketId, // Include the socket ID in the headers
                    },
                });

                console.log('API Response:',  error); // Log the API response for debugging

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
                this.setLoading(false); // Set loading state to false
            }
        },

        // Function to handle supplier updates
        handleSupplierUpdate(supplier) {
            if (supplier && supplier.id) {
                const index = this.suppliers.findIndex(sup => sup.id === supplier.id);
                if (index !== -1) {
                    this.suppliers.splice(index, 1, supplier); // Replace the existing supplier with the updated one
                } else {
                    console.warn('Supplier not found for update:', supplier);
                }
            } else {
                console.warn('Invalid supplier data received for update:', supplier);
            }
        },

        // Function to handle supplier creation
        handleSupplierCreation(supplier) {
            if (supplier && supplier.id && !this.suppliers.some(sup => sup.id === supplier.id)) {
                this.suppliers.push(supplier);
            } else {
                console.warn('Invalid supplier data received for creation or duplicate found:', supplier);
            }
        },

        // Function to handle supplier deletion
        handleSupplierDeletion(id) {
            const supplierId = parseInt(id, 10);
            if (!isNaN(supplierId)) {
                const originalSuppliersLength = this.suppliers.length;
                this.suppliers = this.suppliers.filter(supplier => supplier.id !== supplierId);
                if (this.suppliers.length < originalSuppliersLength) {
                    console.log('Supplier Deleted via Socket');
                } else {
                    console.warn('Supplier ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid supplier ID received for deletion:', id);
            }
        },
    },
});