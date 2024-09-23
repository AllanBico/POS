import { defineStore } from 'pinia';

export const useCustomerStore = defineStore('customer', {
    state: () => ({
        customers: [],
    }),
    getters: {
        CustomerById: (state) => (id) => state.customers.find(customer => customer.id === id) || null,
    },
    actions: {
        search(term) {
            if (!term) return []; // Return empty if no search term provided
            const searchTerm = term.toLowerCase();
            return this.customers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm)
            );
        },
        async fetchCustomers() {
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/customers`, {
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.customers = data.value;
        },
        async createCustomer(customer) {
            console.log("customer",customer)
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/customers`, {
                method: 'POST',
                body: customer,
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.customers.push(data.value);
            $toast.success('Customer Created')
        },
        async updateCustomer(id, customer) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { data, error } = await useFetch(`${config.public.baseURL}/api/customers/${id}`, {
                method: 'PUT',
                body: customer,
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.customers = this.customers.map(c => (c.id === id ? data.value : c));
            $toast.success('Customer Updated')
        },
        async deleteCustomer(id) {
            const { $toast } = useNuxtApp()
            const config = useRuntimeConfig();
            const { error } = await useFetch(`${config.public.baseURL}/api/customers/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.customers = this.customers.filter(c => c.id !== id);
            $toast.warning('Customer Deleted')
        }
    }
});