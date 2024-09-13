// stores/subcategory.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
export const useSubcategoryStore = defineStore('subcategory', {
    state: () => ({
        subcategories: [],
        subcategory: null,
    }),
    getters: {
        SubcategoryById: (state) => (id) => {
            console.log('state.subcategories:', state.subcategories); // Log the subcategories array
            console.log(typeof id)
            console.log("id.value",id)
            const subcategory = state.subcategories.find(subcategory => subcategory.id === id) || null;
            console.log("store subcategory",subcategory)
            return subcategory;
        },
    },
    actions: {
        async fetchSubcategories() {
            const config = useRuntimeConfig();
            const apiUrl = config.public.baseURL + '/api/subcategories';
            const { data, error } = await useFetch(apiUrl, {
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.subcategories = data.value;
        },
        async fetchSubcategory(id) {
            const config = useRuntimeConfig();
            const apiUrl = config.public.baseURL + `/api/subcategories/${id}`;
            const { data, error } = await useFetch(apiUrl, {
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.subcategory = data.value;
        },
        async createSubcategory(subcategory) {
            const config = useRuntimeConfig();
            const apiUrl = `${config.public.baseURL}/api/subcategories`;

            try {
                // Ensure the subcategory includes the categoryId
                console.log("subcategory", subcategory);
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify(subcategory), // Ensure the body is properly formatted as JSON
                    headers: {
                        'Content-Type': 'application/json', // Ensure the server understands the request payload format
                    },
                    credentials: 'include',
                });

                if (error.value) throw error.value;

                // Assuming the backend returns the newly created subcategory with category information
                this.subcategories.push(data.value);
            } catch (error) {
                console.error('Error creating subcategory:', error);
            }
        }
        ,
        async updateSubcategory(id, subcategory) {
            const config = useRuntimeConfig();
            const apiUrl = config.public.baseURL + `/api/subcategories/${id}`;
            const { data, error } = await useFetch(apiUrl, {
                method: 'PUT',
                body: subcategory,
                credentials: 'include',
            });
            if (error.value) throw error.value;
            console.log("store sub dta",data.value)
            const index = this.subcategories.findIndex(sub => sub.id === id);
            if (index !== -1) this.subcategories[index] = data.value;
        },
        async deleteSubcategory(id) {
            const config = useRuntimeConfig();
            const apiUrl = config.public.baseURL + `/api/subcategories/${id}`;
            const { error } = await useFetch(apiUrl, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (error.value) throw error.value;
            this.subcategories = this.subcategories.filter(sub => sub.id !== id);
        },
        // Socket event handlers
        async socketUpdateSubcategory(subCategory) {
            const index = this.subcategories.findIndex(cat => cat.id === subCategory.id);
            if (index !== -1) this.subcategories[index] = subCategory;
        },
        async socketCreateSubcategory(subCategory) {
            const exists = this.subcategories.some(cat => cat.id === subCategory.id);
            // Only add the category if it doesn't already exist
            if (!exists) {
                this.subcategories.push(subCategory);
            }
        },
        async socketDeleteSubcategory(id) {
            const index = this.subcategories.findIndex(subCategory => subCategory.id === id);
            if (index !== -1) this.subcategories.splice(index, 1);
        },
    },
});