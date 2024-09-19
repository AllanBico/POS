import { defineNuxtPlugin } from '#app'
import { useProductStore } from "~/stores/product/ProductStore"
import { useCategoryStore } from "~/stores/product/CategoryStore"
import { useAuthStore } from "~/stores/AuthStore" // Assuming you have an auth store

export default defineNuxtPlugin(async (nuxtApp) => {
    const authStore = useAuthStore()
    const productStore = useProductStore()
    const categoryStore = useCategoryStore()

    // Check if user is authenticated
    const isAuthenticated = authStore.isAuthenticated // Adjust this based on your auth store structure

    const storeActions = [
        { store: productStore, fetchMethod: 'fetchProducts', requiresAuth: true },
        { store: categoryStore, fetchMethod: 'getCategories', requiresAuth: true },
        // Add more stores and their respective fetch method names here
    ]

    const fetchPromises = storeActions.map(async ({ store, fetchMethod, requiresAuth }) => {
        if (typeof store[fetchMethod] !== 'function') {
            console.warn(`Fetch method '${fetchMethod}' not found in store`)
            return
        }

        if (requiresAuth && !isAuthenticated) {
            console.log(`Skipping ${fetchMethod} due to authentication requirement`)
            return
        }

        try {
            await store[fetchMethod]()
        } catch (error) {
            if (error.response?.status === 401) {
                console.log(`Authentication required for ${fetchMethod}`)
                // Optionally redirect to login page or trigger auth flow
                // authStore.redirectToLogin()
            } else {
                console.error(`Error in ${fetchMethod}:`, error)
            }
        }
    })

    // Wait for all fetches to complete
    await Promise.all(fetchPromises)
})