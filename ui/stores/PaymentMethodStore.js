import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const usePaymentMethodStore = defineStore('paymentMethod', {
    state: () => ({
        paymentMethods: [],
        paymentMethod: null,
        error: null,
        loading: false,
    }),

    getters: {
        PaymentMethodById: (state) => (id) => {
            const paymentMethod = state.paymentMethods.find(method => method.id === id);
            if (!paymentMethod) {
                console.warn(`Payment method with id ${id} not found`);
            }
            return paymentMethod;
        },
    },

    actions: {
        async fetchPaymentMethods() {
            await this.performApiCall('GET', '/api/payment-methods', null, (data) => {
                this.paymentMethods = data.data.value;
            }, 'Failed to fetch payment methods');
        },

        async createPaymentMethod(paymentMethod) {
            await this.performApiCall('POST', '/api/payment-methods', paymentMethod, (data) => {
                console.log('Payment method created:', data);
                this.handlePaymentMethodCreation(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, 'Failed to create payment method');
        },

        async updatePaymentMethod(id, paymentMethod) {
            await this.performApiCall('PUT', `/api/payment-methods/${id}`, paymentMethod, (data) => {
                console.log('Payment method updated:', data);
                this.handlePaymentMethodUpdate(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update payment method with ID: ${id}`);
        },

        async deletePaymentMethod(id) {
            await this.performApiCall('DELETE', `/api/payment-methods/${id}`, null, (data) => {
                this.handlePaymentMethodDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message);
                }
            }, `Failed to delete payment method with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdatePaymentMethod(paymentMethod) {
            this.handlePaymentMethodUpdate(paymentMethod);
        },

        socketCreatePaymentMethod(paymentMethod) {
            this.handlePaymentMethodCreation(paymentMethod);
        },

        socketDeletePaymentMethod(id) {
            this.handlePaymentMethodDeletion(id);
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

            console.log('API Call:', { method, endpoint, body, apiUrl });

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method,
                    body,
                    credentials: 'include',
                    headers: {
                        'x-socket-id': socketId,
                    },
                });

                console.log('API Response:',  data,error);

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

        handlePaymentMethodUpdate(paymentMethod) {
            if (paymentMethod && paymentMethod.id) {
                const index = this.paymentMethods.findIndex(method => method.id === paymentMethod.id);
                if (index !== -1) {
                    this.paymentMethods.splice(index, 1, paymentMethod);
                } else {
                    console.warn('Payment method not found for update:', paymentMethod);
                }
            } else {
                console.warn('Invalid payment method data received for update:', paymentMethod);
            }
        },

        handlePaymentMethodCreation(paymentMethod) {
            if (paymentMethod && paymentMethod.id && !this.paymentMethods.some(method => method.id === paymentMethod.id)) {
                this.paymentMethods.push(paymentMethod);
            } else {
                console.warn('Invalid payment method data received for creation or duplicate found:', paymentMethod);
            }
        },

        handlePaymentMethodDeletion(id) {
            const paymentMethodId = parseInt(id, 10);
            if (!isNaN(paymentMethodId)) {
                const originalPaymentMethodsLength = this.paymentMethods.length;
                this.paymentMethods = this.paymentMethods.filter(paymentMethod => paymentMethod.id !== paymentMethodId);
                if (this.paymentMethods.length < originalPaymentMethodsLength) {
                    console.log('Payment method Deleted via Socket');
                } else {
                    console.warn('Payment method ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid payment method ID received for deletion:', id);
            }
        },
    },
});