import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        currentUser: null,
        isLoading: false,
        error: null,
    }),

    getters: {
        userCount: (state) => state.users.length,
        isLoggedIn: (state) => state.currentUser !== null,
        userById: (state) => (id) => state.users.find(user => user.id === id) || null,
    },

    actions: {
        async fetchUsers() {
            this.isLoading = true;
            this.error = null;
            const config = useRuntimeConfig();
            try {
                const apiUrl = config.public.baseURL + '/api/users';
                const { data, error } = await useFetch(apiUrl, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (error.value) {
                    throw new Error(error.value);
                }

                this.users = data.value;
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
                    credentials: 'include',
                });

                if (error.value) {
                    throw new Error(error.value);
                }

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
                    method: 'DELETE',
                    credentials: 'include',
                });

                if (error.value) {
                    throw new Error(error.value);
                }

                this.users = this.users.filter(user => user.id !== userId);
            } catch (err) {
                this.error = err.message;
            }
        },

        async updateUser(userId, updatedData) {
            this.isLoading = true;
            this.error = null;
            const config = useRuntimeConfig();
            try {
                const apiUrl = config.public.baseURL + `/api/users/${userId}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: JSON.stringify(updatedData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (error.value) {
                    throw new Error(error.value);
                }

                // Update the local state
                this.updateLocalUser(userId, data.value);

            } catch (err) {
                this.error = err.message;
            } finally {
                this.isLoading = false;
            }
        },

        setCurrentUser(user) {
            this.currentUser = user;
        },

        clearCurrentUser() {
            this.currentUser = null;
        },

        updateLocalUser(userId, updatedData) {
            const userIndex = this.users.findIndex(user => user.id === userId);
            if (userIndex !== -1) {
                this.users[userIndex] = { ...this.users[userIndex], ...updatedData };
            }
        }
    }
});