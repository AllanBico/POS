// plugins/auth.js
import { useAuthStore } from '~/stores/useAuthStore';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('vue:setup', () => {
        const authStore = useAuthStore();

        nuxtApp.provide('useFetch', (url, options = {}) => {
            options.headers = options.headers || {};
            if (authStore.isAuthenticated) {
                options.headers.Authorization = `Bearer ${authStore.token}`;
            }
            return useFetch(url, options);
        });
    });
});
