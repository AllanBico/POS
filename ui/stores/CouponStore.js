// stores/CouponStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useCouponStore = defineStore('coupon', {
    state: () => ({
        coupons: [],
        coupon: null,
        error: null,
        loading: false, // Loading state to track ongoing requests
        activeCoupon: null, // To store the result of coupon check
    }),
    getters: {
        CouponById: (state) => (id) => {
            const coupon = state.coupons.find(coupon => coupon.id === id);
            if (!coupon) {
                console.warn(`Coupon with id ${id} not found`);
            }
            return coupon;
        },
    },
    actions: {
        async fetchCoupons() {
            await this.performApiCall('GET', '/api/coupons', null, (data) => {
                this.coupons = data.data.value; // Access the data from the API response
            }, 'Failed to fetch coupons');
        },

        async fetchCouponById(id) {
            await this.performApiCall('GET', `/api/coupons/${id}`, null, (data) => {
                this.coupon = data.data.value; // Access the data from the API response
            }, `Failed to fetch coupon with ID: ${id}`);
        },

        async createCoupon(couponData) {
            await this.performApiCall('POST', '/api/coupons', couponData, (data) => {
                console.log('Coupon created:', data);
                this.handleCouponCreation(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, 'Failed to create coupon');
        },

        async updateCoupon(id, couponData) {
            await this.performApiCall('PUT', `/api/coupons/${id}`, couponData, (data) => {
                console.log('Coupon updated:', data);
                this.handleCouponUpdate(data.data.value); // Access the data from the API response
                if (data.message) {
                    useNuxtApp().$toast.success(data.message); // Access the message from the API response
                }
            }, `Failed to update coupon with ID: ${id}`);
        },

        async deleteCoupon(id) {
            await this.performApiCall('DELETE', `/api/coupons/${id}`, null, (data) => {
                this.handleCouponDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message); // Access the message from the API response
                }
            }, `Failed to delete coupon with ID: ${id}`);
        },

        async checkCoupon(code) {
            await this.performApiCall('GET', `/api/coupons/check/${code}`, null, (data) => {
                this.activeCoupon = data.data.value.isActive ? data.data.value.coupon : null;
            }, `Failed to check coupon with code: ${code}`);
        },

        // Socket event handlers
        socketUpdateCoupon(coupon) {
            this.handleCouponUpdate(coupon);
        },

        socketCreateCoupon(coupon) {
            this.handleCouponCreation(coupon);
        },

        socketDeleteCoupon(id) {
            this.handleCouponDeletion(id);
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

                console.log('API Response:',  data); // Log for debugging

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

        handleCouponUpdate(coupon) {
            if (coupon && coupon.id) {
                const index = this.coupons.findIndex(cat => cat.id === coupon.id);
                if (index !== -1) {
                    this.coupons.splice(index, 1, coupon); // Replace the existing coupon with the updated one
                } else {
                    console.warn('Coupon not found for update:', coupon);
                }
            } else {
                console.warn('Invalid coupon data received for update:', coupon);
            }
        },

        handleCouponCreation(coupon) {
            if (coupon && coupon.id && !this.coupons.some(cat => cat.id === coupon.id)) {
                this.coupons.push(coupon);
            } else {
                console.warn('Invalid coupon data received for creation or duplicate found:', coupon);
            }
        },

        handleCouponDeletion(id) {
            const couponId = parseInt(id, 10);
            if (!isNaN(couponId)) {
                const originalCouponsLength = this.coupons.length;
                this.coupons = this.coupons.filter(coupon => coupon.id !== couponId);
                if (this.coupons.length < originalCouponsLength) {
                    console.log('Coupon Deleted via Socket');
                } else {
                    console.warn('Coupon ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid coupon ID received for deletion:', id);
            }
        },
    },
});
