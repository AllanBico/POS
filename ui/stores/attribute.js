import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';

export const useAttributesStore = defineStore('attributes', {
    state: () => ({
        attributes: [],
        attributeValues: [],
        error: null,
    }),
    getters: {
        AttributeById: (state) => (id) => state.attributes.find(attr => attr.id === id) || null,
        ValuesByAttributeId: (state) => (attributeId) => {
            console.log("store attributeId",attributeId)
            console.log("store attributeId type",typeof attributeId)
            const filteredValues = state.attributeValues.filter(value => value.attributeId === attributeId);
            console.log("store filteredValues",filteredValues)
            return filteredValues;
        },
        AttributeValueById: (state) => (attributeId) => state.attributeValues.find(value => value.id === attributeId),
    },
    actions: {
        async fetchAttributes() {
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/attributes';
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.attributes = data.value;
            } catch (err) {
                this.error = err;
            }
        },
        async fetchAttributeValues() {
            console.log("called")
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/attribute-values';
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.attributeValues = data.value;
                console.log("this.attributeValues",this.attributeValues)
            } catch (err) {
                this.error = err;
            }
        },
        async createAttribute(attribute) {
            try {
                const { $toast } = useNuxtApp()
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/attributes';
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: attribute,
                });
                if (error.value) throw error.value;
                this.attributes.push(data.value);
                $toast.success('Attribute Created')
            } catch (err) {
                this.error = err;
            }
        },
        async createAttributeValue(attributeValue) {
            console.log("createAttributeValue")
            try {
                const { $toast } = useNuxtApp()
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/attribute-values';
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: attributeValue,
                });
                if (error.value) throw error.value;
                this.attributeValues.push(data.value);
                $toast.success('Attribute Value Created')
            } catch (err) {
                this.error = err;
            }
        },
        async updateAttribute(id, attribute) {
            try {
                const { $toast } = useNuxtApp()
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + `/api/attributes/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: attribute,
                });
                if (error.value) throw error.value;
                const index = this.attributes.findIndex(attr => attr.id === id);
                if (index !== -1) this.attributes.splice(index, 1, data.value);
                $toast.success('Attribute Updated')
            } catch (err) {
                this.error = err;
            }
        },
        async updateAttributeValue(id, attributeValue) {
            try {
                const { $toast } = useNuxtApp()
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + `/api/attribute-values/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: attributeValue,
                });
                if (error.value) throw error.value;
                const index = this.attributeValues.findIndex(value => value.id === id);
                if (index !== -1) this.attributeValues.splice(index, 1, data.value);
                $toast.success('Attribute Value Updated')
            } catch (err) {
                this.error = err;
            }
        },
        async deleteAttribute(id) {
            try {
                const { $toast } = useNuxtApp()
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + `/api/attributes/${id}`;
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });
                if (error.value) throw error.value;
                this.attributes = this.attributes.filter(attr => attr.id !== id);
                $toast.warning('Attribute Deleted')
            } catch (err) {
                this.error = err;
            }
        },
        async deleteAttributeValue(id) {
            try {
                const { $toast } = useNuxtApp()
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + `/api/attribute-values/${id}`;
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });
                if (error.value) throw error.value;
                this.attributeValues = this.attributeValues.filter(value => value.id !== id);
                $toast.warning('Attribute Value Deleted')
            } catch (err) {
                this.error = err;
            }
        },
        // Socket event handlers
        async socketUpdateAttribute(attribute) {
            const index = this.attributes.findIndex(obj => obj.id === attribute.id);
            if (index !== -1) this.attributes[index] = attribute;
        },
        async socketCreateAttribute(attribute) {
            const exists = this.attributes.some(obj => obj.id === attribute.id);
            // Only add the attribute if it doesn't already exist
            if (!exists) {
                this.attributes.push(attribute);
            }
        },
        async socketDeleteAttribute(id) {
            const index = this.attributes.findIndex(attribute => attribute.id === id);
            if (index !== -1) this.attributes.splice(index, 1);
        },
        async socketUpdateAttributeValue(attribute) {
            const index = this.attributeValues.findIndex(obj => obj.id === attribute.id);
            if (index !== -1) this.attributeValues[index] = attribute;
        },
        async socketCreateAttributeValue(attribute) {
            const exists = this.attributeValues.some(obj => obj.id === attribute.id);
            // Only add the attribute value if it doesn't already exist
            if (!exists) {
                this.attributeValues.push(attribute);
            }
        },
        async socketDeleteAttributeValue(id) {
            const index = this.attributeValues.findIndex(attribute => attribute.id === id);
            if (index !== -1) this.attributeValues.splice(index, 1);
        },
    }
});
