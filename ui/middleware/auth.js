export default defineNuxtRouteMiddleware((to, from) => {
    // Use cookies in Nuxt
    const tokenCookie = useCookie('token');

    // Check if token is available (this works for both client and server)
    if (!tokenCookie.value) {
        console.log("Token not found, redirecting to login");
        return navigateTo('/login');
    } else {
        console.log("Token found:", tokenCookie.value);
        console.log("Authenticated");
    }
});
