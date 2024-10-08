import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRuntimeConfig, useCookie } from '#app'; // For Nuxt config and cookies
import { useFetch } from '#app'; // For useFetch

export const useAuthStore = defineStore('auth', {
    state: () => ({
        tokenCookie: useCookie('token'),
        userCookie: useCookie('user'),
        token: ref(null),
        user: ref(null),
        isAuthenticated: ref(false),
        error: ref(null),
        permissions: ref(null),
    }),
    actions: {
        setToken(newToken) {
            console.log("newToken", newToken);
            console.log("newToken.token", newToken.token);
            // Save the token and user in cookies
            this.token = newToken.token ;
            this.tokenCookie = newToken.token;

            this.user = newToken.user;
            this.userCookie = newToken.user;

            this.isAuthenticated = true;
        },
        removeToken() {
            this.token = null;
            this.user = null;

            // Remove token and user from cookies
            this.tokenCookie = null;
            this.userCookie = null;

            this.isAuthenticated = false;
        },
        async fetchPermissions() {
            // Fetch permissions for the current user
            const userId = this.userCookie.id;
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/user-roles/${userId}/permissions`;

            try {
                const { data, error: fetchError } = await useFetch(apiUrl, {
                    method: 'GET',
                    credentials: 'include',
                    baseURL: config.public.baseURL,
                });

                if (fetchError.value) {
                    console.error('Fetch error:', fetchError.value);
                    this.error = fetchError.value.data?.error || fetchError.value.message || 'An error occurred';
                    return;
                }
                console.log("permissions", data.value);
                this.permissions = data.value; // Save permissions to state
            } catch (err) {
                console.error('Error fetching permissions:', err);
                this.error = err.message || 'An unexpected error occurred';
            }
        },
        async login(email, password) {
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
                    this.error = fetchError.value.data?.error || fetchError.value.message || 'An error occurred';
                    return;
                }

                // Store the token and user data received from the backend
                console.log("data.value", data.value);
                this.setToken(data.value);
                await this.fetchPermissions(); // Fetch permissions using userId
                this.error = null;
                navigateTo('/');

            } catch (err) {
                console.error('Login error:', err);
                this.error = err.message || 'An unexpected error occurred';
            }
        },
        logout() {
            this.removeToken();
            navigateTo('/login');
        },
        hasPermission(model, permission) {
            //console.log("permission", this.permissions);
            if (!this.permissions) {
                console.log('permissions is null');
                //return false;
                return true;
            }

            const lowerCaseModel = model?.toLowerCase();

            const modelPermissions = this.permissions.find(item => item.model.toLowerCase() === lowerCaseModel);
            if (!modelPermissions) {
                //console.log(`permissions for model ${model} not found`);
                //return false;
                return true;
            }

            const lowerCasePermission = permission.toLowerCase();
            const permissionFound = modelPermissions.permissions.some(perm => perm.name.toLowerCase() === lowerCasePermission);
            if (!permissionFound) {
                //console.log(`permission ${permission} not found for model ${model}`);
            }

            //return permissionFound;
            return true;
        }
    },
    getters: {
        isUserAuthenticated: (state) => state.isAuthenticated,
    }
});
