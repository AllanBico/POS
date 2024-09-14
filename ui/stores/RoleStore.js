// stores/useRolePermissionStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useRoleStore = defineStore('rolePermission', {
    state: () => ({
        roles: [],
        permissions: [],
        userRoles: [],
        rolePermissions: [],
        selectedRole: null,
        selectedPermission: null,
        loading: false,
        error: null,
    }),
    getters: {
        getRoleById: (state) => (id) => state.roles.find(role => role.id === id) || null,
    },
    actions: {
        // Fetch all roles
        async fetchRoles() {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/roles`;
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw new Error(error.value.message);
                this.roles = data.value;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Fetch all permissions
        async fetchPermissions() {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/permissions`;
                const { data, error } = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw new Error(error.value.message);
                this.permissions = data.value;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Create a new role
        async createRole(role) {
            this.loading = true;
            this.error = null;
            try {
                console.log("roleName",role)
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/roles`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: { name: role.name },
                    credentials: 'include',
                });
                if (error.value) {
                    this.error = error.value.message;
                    console.error('Error creating role:', error.value);
                }
                this.roles.push(data.value);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Update an existing role
        async updateRole(roleId, role) {
            this.loading = true;
            this.error = null;
            try {
                console.log("roleId, roleName",roleId, role)
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/roles/${roleId}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: { name: role.name },
                    credentials: 'include',
                });
                if (error.value) throw new Error(error.value.message);
                const index = this.roles.findIndex((role) => role.id === roleId);
                this.roles[index] = data.value;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Delete a role
        async deleteRole(roleId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/roles/${roleId}`;
                await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                this.roles = this.roles.filter((role) => role.id !== roleId);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Create a new permission
        async createPermission(permissionName) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/permissions`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: { name: permissionName },
                    credentials: 'include',
                });
                if (error.value) throw new Error(error.value.message);
                this.permissions.push(data.value);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Update an existing permission
        async updatePermission(permissionId, permissionName) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/permissions/${permissionId}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: { name: permissionName },
                    credentials: 'include',
                });
                if (error.value) throw new Error(error.value.message);
                const index = this.permissions.findIndex((perm) => perm.id === permissionId);
                this.permissions[index] = data.value;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Delete a permission
        async deletePermission(permissionId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/permissions/${permissionId}`;
                await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                this.permissions = this.permissions.filter((perm) => perm.id !== permissionId);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Assign a permission to a role
        async assignPermissionToRole(roleId, permissionId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/role-permissions`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: { roleId, permissionId },
                    credentials: 'include',
                });
                if (error.value) throw new Error(error.value.message);
                this.rolePermissions.push(data.value);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Remove a permission from a role
        async removePermissionFromRole(roleId, permissionId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/role-permissions/remove`;
                await useFetch(apiUrl, {
                    method: 'DELETE',
                    body: { roleId, permissionId },
                    credentials: 'include',
                });
                this.rolePermissions = this.rolePermissions.filter(
                    (rolePermission) =>
                        !(rolePermission.roleId === roleId && rolePermission.permissionId === permissionId)
                );
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Assign a role to a user
        async assignRoleToUser(userId, roleId) {
            this.loading = true;
            this.error = null;
            try {
                const { data, error } = await useFetch('/api/user-roles/', {
                    method: 'POST',
                    body: { userId, roleId },
                    credentials: 'include',
                });
                if (error.value) throw new Error(error.value.message);
                this.userRoles.push(data.value);
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        // Remove a role from a user
        async removeRoleFromUser(userId, roleId) {
            this.loading = true;
            this.error = null;
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/user-roles/`;
                await useFetch(apiUrl, {
                    method: 'DELETE',
                    body: { userId, roleId },
                    credentials: 'include',
                });
                this.userRoles = this.userRoles.filter(
                    (userRole) => !(userRole.userId === userId && userRole.roleId === roleId)
                );
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },
    },
});