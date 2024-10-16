// stores/BrandStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useBrandStore = defineStore('brand', {
    state: () => ({
        brands: [],
        error: null,
        loading: false,
    }),

    getters: {
        getBrandById: (state) => (id) => {
            const brand = state.brands.find(brand => brand.id === id);
            if (!brand) {
                console.warn(`Brand with id ${id} not found`);
            }
            return brand;
        },
    },

    actions: {
        async fetchBrands() {
            await this.performApiCall('GET', '/api/brands', null, (data) => {
                this.brands = data;
            }, 'Failed to fetch brands');
        },

        async createBrand(brand) {
            await this.performApiCall('POST', '/api/brands', brand, (data) => {
                this.handleBrandCreation(data);
                useNuxtApp().$toast.success('Brand Created');
            }, 'Failed to create brand');
        },

        async updateBrand(id, updatedBrand) {
            await this.performApiCall('PUT', `/api/brands/${id}`, updatedBrand, (data) => {
                this.handleBrandUpdate(data);
                useNuxtApp().$toast.success('Brand Updated');
            }, `Failed to update brand with ID: ${id}`);
        },

        async deleteBrand(id) {
            await this.performApiCall('DELETE', `/api/brands/${id}`, null, () => {
                this.handleBrandDeletion(id);
                useNuxtApp().$toast.warning('Brand Deleted');
            }, `Failed to delete brand with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateBrand(brand) {
            this.handleBrandUpdate(brand);
        },

        socketCreateBrand(brand) {
            this.handleBrandCreation(brand);
        },

        socketDeleteBrand(id) {
            this.handleBrandDeletion(id);
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
                    onSuccess(data.value.data);
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

        handleBrandUpdate(brand) {
            if (brand && brand.id) {
                const index = this.brands.findIndex(b => b.id === brand.id);
                if (index !== -1) {
                    this.brands.splice(index, 1, brand); // Replace the existing brand with the updated one
                    console.log('brand',brand)
                } else {
                    console.warn('Brand not found for update:', brand);
                }
            } else {
                console.warn('Invalid brand data received for update:', brand);
            }
        },

        handleBrandCreation(brand) {
            if (brand && brand.id && !this.brands.some(brand => brand.id === brand.id)) {
                this.brands.push(brand);
            } else {
                console.warn('Invalid brand data received for creation or duplicate found:', brand);
            }
        },

        handleBrandDeletion(id) {
            const brandId = parseInt(id, 10);
            if (!isNaN(brandId)) {
                const initialLength = this.brands.length;
                this.brands = this.brands.filter(brand => brand.id !== brandId);
                if (this.brands.length < initialLength) {
                    console.log('Brand Deleted via Socket');
                } else {
                    console.warn('Brand ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid brand ID received for deletion:', id);
            }
        },
    },
});