// stores/tabsStore.js
import { defineStore } from 'pinia';
import Dashboard from '@/components/Dashboard.vue';
export const useTabsStore = defineStore('tabsStore', {
    
    state: () => ({
        tabs: [{ key: '1', title: 'Dashboard', component: 'Dashboard', closable: false }],
        activeKey: '1',
        nextKey: 2,
    }),
    actions: {
        addTab(title, component, props = {}, closable = true) {
            const existingTab = this.tabs.find(tab => tab.title === title);

            if (!existingTab) {
                const newKey = String(this.nextKey++);
                this.tabs.push({ key: newKey, title, component, props, closable });
                this.activeKey = newKey;
            } else {
                existingTab.props = { ...existingTab.props, ...props };
                this.activeKey = existingTab.key;
            }
        },

        removeTab(targetKey) {
            const index = this.tabs.findIndex(tab => tab.key === targetKey);
            if (index === -1) return;

            this.tabs.splice(index, 1);

            if (this.activeKey === targetKey) {
                this.activeKey = this.tabs[index] ? this.tabs[index].key : 
                                 this.tabs[index - 1] ? this.tabs[index - 1].key : 
                                 this.tabs[0] ? this.tabs[0].key : '';
            }
        },

        switchTab(key) {
            if (this.tabs.some(tab => tab.key === key)) {
                this.activeKey = key;
            } else {
                console.warn(`Tab with key ${key} not found`);
            }
        },

        updateTabTitle(key, newTitle) {
            const tab = this.tabs.find(tab => tab.key === key);
            if (tab) {
                tab.title = newTitle;
            }
        },

        clearAllTabs() {
            this.tabs = this.tabs.filter(tab => !tab.closable);
            this.activeKey = this.tabs[0] ? this.tabs[0].key : '';
        },
    },
    getters: {
        currentTab: (state) => state.tabs.find(tab => tab.key === state.activeKey),
        tabCount: (state) => state.tabs.length,
    },
});
