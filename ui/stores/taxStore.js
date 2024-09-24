import { defineStore } from 'pinia';

export const useTaxStore = defineStore('tax', {
    state: () => ({
        taxes: [],
        tax: null,
    }),
    getters: {
        TaxById: (state) => (id) => {
            const brand = state.taxes.find(tax => tax.id === id);
            if (!tax) {
                console.error(`tax with id ${id} not found`);
                return null;
            }
            console.error(`tax with id ${id}  found`);
            return brand;
        },
    },
    actions: {
        async fetchTaxes() {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/taxes`;
                const { data } = await useFetch(apiUrl);
                this.taxes = data.value;
            } catch (error) {
                console.error('Failed to load taxes');
            }
        },

        async fetchTaxById(id) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/taxes/${id}`;
                const { data } = await useFetch(apiUrl);
                this.tax = data.value;
            } catch (error) {
                console.error('Failed to load tax');
            }
        },
        async fetchTaxByProduct(id) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/taxes/product/${id}`;
                const { data } = await useFetch(apiUrl);
                return data.value.taxIds;
            } catch (error) {
                console.error('Failed to load tax');
            }
        },

        async createTax(taxData) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/taxes`;
                const { data } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: taxData,
                });
                this.taxes.push(data.value);
            } catch (error) {
                console.log("error",error)
            }
        },

        async updateTax(id, taxData) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/taxes/${id}`;
                const { data } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: taxData,
                });
            } catch (error) {
                console.error('Failed to update tax');
            }
        },

        async deleteTax(id) {
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/taxes/${id}`;
                await $fetch(apiUrl, { method: 'DELETE' });

            } catch (error) {
                console.error('Failed to delete tax');
            }
        },
    },
});
