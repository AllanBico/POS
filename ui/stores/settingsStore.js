import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settings: [], // Changed to an empty array
        error: null,
    }),
    actions: {
        async fetchSettings() {
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/settings`;
            try {
                const { data } = await useFetch(apiUrl, {
                    credentials: 'include',
                });
                this.settings = data.value || []; // Ensure it's an array
            } catch (error) {
                this.error = error;
            }
        },
        async updateSetting(key, value) {
            const config = useRuntimeConfig();
            const setting = this.settings.find(item => item.key === key);
            if (setting) {
                try {
                    const apiUrl = `${config.public.baseURL}/api/settings/${setting.id}`;
                    const response = await fetch(apiUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ value: JSON.stringify(value) }),
                    });
                    if (!response.ok) throw new Error('Failed to update setting');
                    setting.value = JSON.stringify(value); // Update local value in store
                    $toast.success('Setting updated successfully');
                } catch (e) {
                    $toast.error('Failed to update setting');
                    console.error(e.message);
                }
            }
        },
        async deleteSettings() {
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/settings`;
            try {
                await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                this.settings = []; // Reset settings to an empty array
            } catch (error) {
                this.error = error;
            }
        },
    },
    getters: {
        getSettingByKey: (state) => (key) => {
            if (Array.isArray(state.settings)) {
                const setting = state.settings.find(item => item.key === key);
                if (setting) {
                    try {
                        return JSON.parse(setting.value);
                    } catch {
                        return setting.value;
                    }
                }
            }
            return null;
        },
        getSettingsByCategory: (state) => (category) => {
            return state.settings.filter(setting => setting.category === category);
        }
    },
});
