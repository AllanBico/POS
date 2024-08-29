import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    // State: Holds reactive properties
    state: () => ({
        users: [],
        currentUser: null
    }),

    // Getters: Computed properties for derived state
    getters: {
        userCount: (state) => state.users.length,
        isLoggedIn: (state) => state.currentUser !== null,
        userById: (state) => (id) => state.users.find(user => user.id === id) || null
    },

    // Actions: Methods to modify the state and perform operations
    actions: {
        addUser(user) {
            if (!this.users.find(u => u.id === user.id)) {
                this.users.push(user);
            }
        },

        removeUser(userId) {
            this.users = this.users.filter(user => user.id !== userId);
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
