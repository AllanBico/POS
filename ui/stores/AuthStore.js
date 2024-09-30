import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRuntimeConfig, useCookie } from '#app'; // For Nuxt config and cookies
import { useFetch } from '#app'; // For useFetch

export const useAuthStore = defineStore('auth', () => {
    // Use cookies to store the token and user information
    const tokenCookie = useCookie('token');
    const userCookie = useCookie('user');
    const token = ref(tokenCookie.value || null);
    const user = ref(userCookie.value || null);
    const isAuthenticated = ref(!!token.value);
    const error = ref(null);

    const setToken = (newToken) => {
        // Save the token and user in cookies
        token.value = newToken.token;
        tokenCookie.value = newToken.token;

        user.value = newToken.user;
        userCookie.value = newToken.user;

        isAuthenticated.value = true;
    };

    const removeToken = () => {
        token.value = null;
        user.value = null;

        // Remove token and user from cookies
        tokenCookie.value = null;
        userCookie.value = null;

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
                console.log("error.value", fetchError.value.statusCode);
                console.log("error.value.data", fetchError.value.data.error);
                console.error('Fetch error:', fetchError.value);
                error.value = fetchError.value.data?.error || fetchError.value.message || 'An error occurred';
                return;
            }

            // Store the token and user data received from the backend
            setToken(data.value);
            error.value = null;
            navigateTo('/');

        } catch (err) {
            console.error('Login error:', err);
            error.value = err.message || 'An unexpected error occurred';
        }
    };

    const logout = () => {
        removeToken();
        navigateTo('/login')
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
