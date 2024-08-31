import { defineStore } from 'pinia';

export const useBrandStore = defineStore('brand', {
    state: () => ({
        brands: [],
        error: null,
    }),
    getters: {
        BrandById: (state) => (id) => state.brands.find(brand => brand.id === id) || null,
    },
    actions: {
        async fetchBrands() {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/brands`;
                const { data, error } = await useFetch(apiUrl);

                if (error.value) throw error.value;

                this.brands = data.value;
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        },

        async createBrand(brand) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/brands`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: brand,
                });

                if (error.value) throw error.value;

                this.brands.push(data.value);
            } catch (error) {
                console.error('Error creating brand:', error);
            }
        },

        async updateBrand(id, updatedBrand) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/brands/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: updatedBrand,
                });

                if (error.value) throw error.value;

                const index = this.brands.findIndex((brand) => brand.id === id);
                if (index !== -1) {
                    this.brands[index] = data.value;
                }
            } catch (error) {
                console.error('Error updating brand:', error);
            }
        },

        async deleteBrand(id) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/brands/${id}`;
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });

                if (error.value) throw error.value;

                this.brands = this.brands.filter((brand) => brand.id !== id);
            } catch (error) {
                console.error('Error deleting brand:', error);
            }
        },
    },
});
