// stores/PaymentStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        payments: [], // List of all payments
        payment: null, // Single payment for detailed view
        error: null,
        loading: false,
    }),
    getters: {
        PaymentById: (state) => (id) => state.payments.find(payment => payment.id === id) || null,
    },
    actions: {
        // Set loading state
        setLoading(loading) {
            this.loading = loading;
        },

        // Error handling function
        handleError(error, message = 'An error occurred') {
            this.error = error;
        },

        // Fetch all payments
        async fetchPayments() {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/payments`;

            try {
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.payments = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch payments');
            } finally {
                this.setLoading(false);
            }
        },

        // Fetch single payment by ID
        async fetchPaymentById(id) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/payments/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.payment = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch payment');
            } finally {
                this.setLoading(false);
            }
        },

        // Create a new payment
        async createPayment(paymentData) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/payments`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: paymentData,
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.payments.push(data.value);
            } catch (error) {
                this.handleError(error, 'Failed to create payment');
            } finally {
                this.setLoading(false);
            }
        },

        // Update an existing payment
        async updatePayment(id, updatedData) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/payments/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: updatedData,
                    credentials: 'include',
                });
                if (error.value) throw error.value;

                // Update local state with the new payment data
                const index = this.payments.findIndex(payment => payment.id === id);
                if (index !== -1) {
                    this.payments[index] = data.value;
                }
            } catch (error) {
                this.handleError(error, 'Failed to update payment');
            } finally {
                this.setLoading(false);
            }
        },

        // Delete a payment
        async deletePayment(id) {
            this.setLoading(true);
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/payments/${id}`;

            try {
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error.value) throw error.value;

                // Remove from local state
                this.payments = this.payments.filter(payment => payment.id !== id);
            } catch (error) {
                this.handleError(error, 'Failed to delete payment');
            } finally {
                this.setLoading(false);
            }
        },
    },
});
