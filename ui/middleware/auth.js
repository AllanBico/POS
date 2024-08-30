
import nuxtStorage from "nuxt-storage";
import {jwtDecode} from "jwt-decode";



export default defineNuxtRouteMiddleware(async (to, from) => {
    const token = nuxtStorage.localStorage.getData('token');
    console.log("Token from localStorage:", token);

    if (!token) {
        console.log("No token found, redirecting to login");
        //return navigateTo('/login');
    }

    try {
        const decodedToken = jwtDecode(token);
        const expiration = decodedToken.exp * 1000; // Convert exp to milliseconds
        const now = Date.now();

        if (now > expiration) {
            console.log("Token expired, redirecting to login");
            nuxtStorage.localStorage.removeItem('token');
            //return navigateTo('/login');
        }
    } catch (e) {
        console.error("Failed to decode token:", e);
        nuxtStorage.localStorage.removeItem('token');
        //return navigateTo('/login');
    }

    console.log("Token is valid, access granted");
});