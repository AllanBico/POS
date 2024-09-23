import { defineStore } from 'pinia';
import { useNuxtApp, useRuntimeConfig, useFetch } from '#app';

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
                console.error(`Brand with id ${id} not found`);
                return null;
            }
            return brand;
        },
    },
    actions: {
        setLoading(loading) {
            this.loading = loading;
        },

        handleError(error, message = 'An error occurred') {
            const { $toast } = useNuxtApp();
            this.error = error;
            $toast.error(message);
            console.error(message, error);
        },

        async fetchBrands() {
            this.setLoading(true);
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/brands`;
                const { data, error } = await useFetch(apiUrl, {
                    credentials: 'include',
                });

                if (error.value) throw error.value;

                this.brands = data.value;
            } catch (error) {
                this.handleError(error, 'Error fetching brands');
            } finally {
                this.setLoading(false);
            }
        },

        async createBrand(brand) {
            this.setLoading(true);
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/brands`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: brand,
                    credentials: 'include',
                });

                if (error.value) throw error.value;

                this.brands.push(data.value);
                useNuxtApp().$toast.success('Brand Created');
            } catch (error) {
                this.handleError(error, 'Error creating brand');
            } finally {
                this.setLoading(false);
            }
        },

        async updateBrand(id, updatedBrand) {
            this.setLoading(true);
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/brands/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: updatedBrand,
                    credentials: 'include',
                });

                if (error.value) throw error.value;

                const index = this.brands.findIndex((brand) => brand.id === id);
                if (index !== -1) {
                    this.brands[index] = data.value;
                }
                useNuxtApp().$toast.success('Brand Updated');
            } catch (error) {
                this.handleError(error, 'Error updating brand');
            } finally {
                this.setLoading(false);
            }
        },

        async deleteBrand(id) {
            this.setLoading(true);
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/brands/${id}`;
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                if (error.value) throw error.value;

                this.brands = this.brands.filter((brand) => brand.id !== id);
                useNuxtApp().$toast.success('Brand Deleted');
            } catch (error) {
                this.handleError(error, 'Error deleting brand');
            } finally {
                this.setLoading(false);
            }
        },

        // Socket event handlers
        socketUpdateBrand(brand) {
            const index = this.brands.findIndex(obj => obj.id === brand.id);
            if (index !== -1) this.brands[index] = brand;
        },

        socketCreateBrand(brand) {
            if (!this.brands.some(obj => obj.id === brand.id)) {
                this.brands.push(brand);
            }
        },

        socketDeleteBrand(id) {
            const index = this.brands.findIndex(brand => brand.id === id);
            if (index !== -1) this.brands.splice(index, 1);
        },
    },
});