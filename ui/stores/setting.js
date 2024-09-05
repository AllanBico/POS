import { defineStore } from 'pinia';

export const useSettingStore = defineStore('setting', {
    state: () => ({
        isMobile: false,
        theme: { mode: 'dark' },
        layout: 'side',
        footerLinks: [],
        copyright: '',
        fixedHeader: true,
        fixedSideBar: true,
        fixedTabs: true,
        hideSetting: false,
        multiPage: false,
        firstMenu: [],
        subMenu: [],
        menuData: [],
        route: null,
    }),
    actions: {
        correctPageMinHeight(value) {
            // Logic to correct page min height
        },
        setActivatedFirst(fullPath) {
            // Logic to set the first activated menu
        },
    },
    getters: {
        // Define getters if needed
    },
});
