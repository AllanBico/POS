export default defineNuxtPlugin((nuxtApp) => {
    // Check if we are in the browser to use localStorage
    if (process.client) {
        // Intercept the useFetch calls
        nuxtApp.hook('app:rendered', () => {
            const originalUseFetch = useFetch;

            useFetch = (url, options = {}) => {
                const token = localStorage.getItem('token');

                // Modify headers to include the token
                if (token) {
                    options.headers = {
                        ...options.headers,
                        Authorization: `Bearer ${token}`,
                    };
                }

                return originalUseFetch(url, options);
            };
        });
    }
});
