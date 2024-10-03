// stores/CouponStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useCouponStore = defineStore('coupon', {
    state: () => ({
        coupons: [],
        coupon: null,
        error: null,
        loading: false, // Loading state to track ongoing requests
        activeCoupon: null, // To store the result of coupon check
    }),
    getters: {
        CouponById: (state) => (id) => state.coupons.find(coupon => coupon.id === id) || null,
    },
    actions: {
        async fetchCoupons() {
            this.setLoading(true); // Start loading
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/coupons`;

            try {
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.coupons = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch coupons');
            } finally {
                this.setLoading(false); // Stop loading
            }
        },

        async fetchCouponById(id) {
            this.setLoading(true); // Start loading
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/coupons/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.coupon = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to fetch coupon');
            } finally {
                this.setLoading(false); // Stop loading
            }
        },

        async createCoupon(couponData) {
            this.setLoading(true); // Start loading
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/coupons`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify(couponData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.coupons.push(data.value);
            } catch (error) {
                this.handleError(error, 'Failed to create coupon');
            } finally {
                this.setLoading(false); // Stop loading
            }
        },

        async updateCoupon(id, couponData) {
            this.setLoading(true); // Start loading
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/coupons/${id}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: JSON.stringify(couponData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.coupons = this.coupons.map(coupon => (coupon.id === id ? data.value : coupon));
                this.coupon = data.value;
            } catch (error) {
                this.handleError(error, 'Failed to update coupon');
            } finally {
                this.setLoading(false); // Stop loading
            }
        },

        async deleteCoupon(id) {
            this.setLoading(true); // Start loading
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/coupons/${id}`;

            try {
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.coupons = this.coupons.filter(coupon => coupon.id !== id);
                this.coupon = null;
            } catch (error) {
                this.handleError(error, 'Failed to delete coupon');
            } finally {
                this.setLoading(false); // Stop loading
            }
        },

        async checkCoupon(code) {
            this.setLoading(true); // Start loading
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/coupons/check/${code}`;

            try {
                const { data, error } = await useFetch(apiUrl, {
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.activeCoupon = data.value.isActive ? data.value.coupon : null;
                return data.value;
            } catch (error) {
                this.handleError(error, 'Failed to check coupon');
                return null;
            } finally {
                this.setLoading(false); // Stop loading
            }
        },

        setLoading(isLoading) {
            this.loading = isLoading;
        },

        handleError(error, message) {
            this.error = { message, details: error.message };
            console.error(message, error);
        }
    }
});
