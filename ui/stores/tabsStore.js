// stores/tabsStore.js
import { defineStore } from 'pinia';

export const useTabsStore = defineStore('tabsStore', {
    state: () => ({
        tabs: [{ key: '1', title: 'Dashboard', component: 'dashboardComponent' }],
        activeKey: '1',
    }),
    actions: {
        addTab(title, component, props = {}) {
            const existingTab = this.tabs.find(tab => tab.title === title);

            if (!existingTab) {
                const newKey = String(this.tabs.length + 1);

                // Add component along with the passed props
                this.tabs.push({ key: newKey, title, component, props });
                this.activeKey = newKey;
            } else {
                // If the tab already exists, update the props and activate the tab
                existingTab.props = props;
                this.activeKey = existingTab.key;
            }
        },

        removeTab(targetKey) {
            this.tabs = this.tabs.filter(tab => tab.key !== targetKey);
            if (this.tabs.length > 0) {
                this.activeKey = this.tabs[0].key;  // Switch to first tab if any left
            }
        },
        switchTab(key) {
            const tab = this.tabs.find(tab => tab.key === key);
            if (tab) {
                this.activeKey = key;
            } else {
                console.warn(`Tab with key ${key} not found`);
            }
        },
    },
});
