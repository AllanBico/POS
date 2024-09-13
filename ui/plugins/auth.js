export default defineNuxtPlugin(() => {
    return {
        provide: {
            auth: {
                isAuthenticated: () => {
                    const token =   useCookie('token');
                    return !!token; // Return true if token exists
                },
                logout: () => {
                }
            }
        }
    };
});
