import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#imports'; // Use this if you have API base URL in runtime config

export const useGoodsReceivingStore = defineStore('goodsReceiving', {
    state: () => ({
        goodsReceived: [],  // Stores all goods received entries (GRNs)
        goodsReceivedItem: null,  // Stores a single GRN detail
        loading: false,  // Loading state
        error: null,  // Error state
    }),
    getters: {
        goodsReceivedById: (state) => (id) => state.goodsReceived.find(rec => rec.id === id) || null,
    },
    actions: {
        // Fetch all goods received (GRNs)
        async fetchGoodsReceived() {
            if (this.loading) return; // Prevent concurrent requests
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const response = await fetch(`${config.public.baseURL}/api/goods-received`);
                if (!response.ok) {
                    throw new Error('Failed to fetch goods received data');
                }
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('Invalid response from server');
                }
                this.goodsReceived = data;
            } catch (err) {
                this.error = err.message || 'An unexpected error occurred';
            } finally {
                this.loading = false;
            }
        },

        // Fetch a single GRN by ID
        async fetchGoodsReceivedById(id) {
            if (this.loading) return; // Prevent concurrent requests
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const response = await fetch(`${config.public.baseURL}/api/goods-received/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch goods received details');
                }
                const data = await response.json();
                if (typeof data !== 'object' || data === null) {
                    throw new Error('Invalid response from server');
                }
                this.goodsReceivedItem = data;
            } catch (err) {
                this.error = err.message || 'An unexpected error occurred';
            } finally {
                this.loading = false;
            }
        },

        // Submit received goods (Create a new GRN entry)
        async receiveGoods(payload) {
            console.log("payload",payload)
            if (this.loading) return; // Prevent concurrent requests
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const response = await fetch(`${config.public.baseURL}/api/goods-received`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                const { data, error } = await response.json();
                if (error.value) {
                    this.error = error.value.data?.message || error.value.message;
                    console.log("this.error",error)
                    throw error.value;
                }
                const newGRN = data;
                if (!newGRN || typeof newGRN !== 'object') {
                    throw new Error('Invalid response from server');
                }
                this.goodsReceived.push(newGRN);
            } catch (err) {
                this.error = err.message || 'An unexpected error occurred';
            } finally {
                this.loading = false;
            }
        },

        // Handle socket update for real-time data sync (optional)
        socketUpdate(goodsReceived) {
            const index = this.goodsReceived.findIndex(item => item.id === goodsReceived.id);
            if (index !== -1) {
                this.goodsReceived[index] = goodsReceived;
            } else {
                this.goodsReceived.push(goodsReceived);
            }
        },

        // Handle socket delete (optional)
        socketDelete(id) {
            this.goodsReceived = this.goodsReceived.filter(item => item.id !== id);
        },

        // Utility to set loading state
        setLoading(isLoading) {
            this.loading = isLoading;
        },
    },
});