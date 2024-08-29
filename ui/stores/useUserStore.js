import { defineStore } from 'pinia';
import {useRuntimeConfig} from '#app'
export const useUserStore = defineStore('user', {
    // State: Holds reactive properties
    state: () => ({
        users: [],
        currentUser: null,
        isLoading: false, // Loading state to manage the fetching process
        error: null,      // Error state to handle errors
    }),

    // Getters: Computed properties for derived state
    getters: {
        userCount: (state) => state.users.length,
        isLoggedIn: (state) => state.currentUser !== null,
        userById: (state) => (id) => state.users.find(user => user.id === id) || null,
    },

    // Actions: Methods to modify the state and perform operations
    actions: {
        async fetchUsers() {
            this.isLoading = true;
            this.error = null;
            const config = useRuntimeConfig();
            try {
                const apiUrl = config.public.baseURL + '/api/users';
                const { data, error } = await useFetch(apiUrl, {
                    method: 'GET',
                });
                if (error.value) {
                    throw new Error(error.value);
                }

                this.users = data.value; // Update the users state with the fetched data
            } catch (err) {
                this.error = err.message;
            } finally {
                this.isLoading = false;
            }
        },

        async addUser(user) {
            this.isLoading = true;
            this.error = null;
            const config = useRuntimeConfig();
            try {
                const apiUrl = config.public.baseURL + '/api/users';
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify(user),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (error.value) {
                    throw new Error(error.value);
                }

                // Add the newly created user to the local state
                this.users.push(data.value);

            } catch (err) {
                this.error = err.message;
            } finally {
                this.isLoading = false;
            }
        },

        async deleteUser(userId) {
            const config = useRuntimeConfig();
            try {
                const apiUrl = config.public.baseURL + `/api/users/${userId}`;
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE'
                });
                if (error.value) {
                    throw new Error(error.value);
                }

                // Remove the deleted user from the state
                this.users = this.users.filter(user => user.id !== userId);
            } catch (err) {
                this.error = err.message;
            }
        },

        setCurrentUser(user) {
            this.currentUser = user;
        },

        clearCurrentUser() {
            this.currentUser = null;
        },

        updateUser(userId, updatedData) {
            const userIndex = this.users.findIndex(user => user.id === userId);
            if (userIndex !== -1) {
                this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
            }
        }
    }
});
