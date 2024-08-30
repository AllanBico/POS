import { defineStore } from 'pinia';
import {jwtDecode} from 'jwt-decode';
import { ref } from 'vue';
import { useRuntimeConfig } from '#app'; // For Nuxt config access
import { useFetch } from '#app'; // For useFetch
import nuxtStorage from 'nuxt-storage';
export const useAuthStore = defineStore('auth', () => {
    const token = ref(nuxtStorage.localStorage.getData('token') || null);
    const user = ref(nuxtStorage.localStorage.getData('user') || null);
    const isAuthenticated = ref(!!token.value);
    const error = ref(null);

    const setToken = (newToken) => {
        token.value = newToken.token;
        nuxtStorage.localStorage.setData('token', newToken.token, 4, 'h');
        nuxtStorage.localStorage.setData('user', newToken.user, 4, 'h');
        user.value = newToken.user;
        isAuthenticated.value = true;
    };

    const removeToken = () => {
        token.value = null;
        user.value = null;
        nuxtStorage.localStorage.removeItem('token');
        nuxtStorage.localStorage.removeItem('user');

        isAuthenticated.value = false;
    };

    const login = async (email, password) => {
        const config = useRuntimeConfig();
        const apiUrl = `${config.public.baseURL}/api/auth/login`;

        try {
            const { data, error: fetchError } = await useFetch(apiUrl, {
                method: 'POST',
                baseURL: config.public.baseURL,
                body: { email, password },
            });

            if (fetchError.value) {
                console.log("error.value",fetchError.value.statusCode)
                console.log("error.value.data",fetchError.value.data.error)
                console.error('Fetch error:', fetchError.value);
                error.value = fetchError.value.data?.error || fetchError.value.message || 'An error occurred';
                return;
            }

            // Store the token and user data received from the backend
            setToken(data.value);
            error.value = null;
            console.log("login end")
            navigateTo('/users')

        } catch (err) {
            console.error('Login error:', err);
            error.value = err.message || 'An unexpected error occurred';
        }
    };

    const logout = () => {
        removeToken();
    };

    return {
        token,
        user,
        isAuthenticated,
        login,
        logout,
        setToken,
        removeToken,
        error
    };
});
