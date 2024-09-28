import {defineStore} from 'pinia';
import {useRuntimeConfig} from '#app';

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
                const {data} = await useFetch(apiUrl, {
                    credentials: 'include',
                });
                this.settings = data.value; // Ensure it's an array
            } catch (error) {
                this.error = error;
            }
        },
        async updateSettings(updatedSettings) {
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/settings`;
            console.log('updatedSettings', updatedSettings);

            // Convert Map to a plain object
            const settingsObject = Object.fromEntries(updatedSettings);

            try {
                const {data} = await useFetch(apiUrl, {
                    method: 'PUT',
                    credentials: 'include',
                    body: JSON.stringify(settingsObject),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                this.settings = data.value;
            } catch (error) {
                this.error = error;
            }
        },


        async uploadFile(file) {
            const config = useRuntimeConfig();
            const formData = new FormData();
            formData.append('file', file);

            try {
                const {data} = await useFetch(`${config.public.baseURL}/api/upload`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });
                return data;
            } catch (error) {
                console.error('Failed to upload file:', error);
                return null;
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
