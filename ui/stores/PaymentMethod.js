import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
export const usePaymentMethodStore = defineStore('paymentMethod', {
    state: () => ({
        paymentMethods: [],
        error: null,
    }),
    getters: {
        PaymentMethodById: (state) => (id) => {
            const paymentMethod = state.paymentMethods.find(method => method.id === id);
            if (!paymentMethod) {
                console.error(`Payment method with id ${id} not found`);
                return null;
            }
            return paymentMethod;
        },
    },
    actions: {
        async fetchPaymentMethods() {
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/payment-methods`;
            const { data, error } = await useFetch(apiUrl);
            if (error.value) {
                this.error = error.value.message;
                console.error('Error fetching payment methods:', error.value);
            } else {
                this.paymentMethods = data.value;
            }
        },
        async createPaymentMethod(paymentMethod) {
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/payment-methods`;
            const { data, error } = await useFetch(apiUrl, {
                method: 'POST',
                body: paymentMethod
            });
            if (error.value) {
                this.error = error.value.message;
                console.error('Error creating payment method:', error.value);
                $toast.error('Error creating payment method');
            } else {
                this.paymentMethods.push(data.value);
                $toast.success('Payment Method created');
            }
        },
        async updatePaymentMethod(id, updatedData) {
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/payment-methods/${id}`;
            const { data, error } = await useFetch(apiUrl, {
                method: 'PUT',
                body: updatedData
            });
            if (error.value) {
                this.error = error.value.message;
                console.error('Error updating payment method:', error.value);
                $toast.error('Error updating payment method');
            } else {
                const index = this.paymentMethods.findIndex(method => method.id === id);
                if (index !== -1) {
                    this.paymentMethods[index] = data.value;
                }
                $toast.success('Payment Method updated');
            }
        },
        async deletePaymentMethod(id) {
            const { $toast } = useNuxtApp();
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/payment-methods/${id}`;
            const { error } = await useFetch(apiUrl, {
                method: 'DELETE',
            });
            if (error.value) {
                this.error = error.value.message;
                console.error('Error deleting payment method:', error.value);
                $toast.error('Error deleting payment method');
            } else {
                this.paymentMethods = this.paymentMethods.filter(method => method.id !== id);
                $toast.warning('Payment Method Deleted');
            }
        },
    },
});