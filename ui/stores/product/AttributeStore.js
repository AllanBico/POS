import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useAttributesStore = defineStore('attributes', {
    state: () => ({
        attributes: [],
        attributeValues: [],
        error: null,
        loading: false,
    }),

    getters: {
        AttributeById: (state) => (id) => {
            const attribute = state.attributes.find(attr => attr.id === id);
            if (!attribute) {
                console.warn(`Attribute with id ${id} not found`);
            }
            return attribute;
        },
        ValuesByAttributeId: (state) => (attributeId) => {
            const filteredValues = state.attributeValues.filter(value => value.attributeId === attributeId);
            return filteredValues;
        },
        AttributeValueById: (state) => (id) => {
            const attributeValue = state.attributeValues.find(value => value.id === id);
            if (!attributeValue) {
                console.warn(`Attribute Value with id ${id} not found`);
            }
            return attributeValue;
        },
    },

    actions: {
        async fetchAttributes() {
            await this.performApiCall('GET', '/api/attributes', null, (data) => {
                this.attributes = data.data.value;
            }, 'Failed to fetch attributes');
        },

        async fetchAttributeValues() {
            await this.performApiCall('GET', '/api/attribute-values', null, (data) => {
                this.attributeValues = data.data.value;
            }, 'Failed to fetch attribute values');
        },

        async createAttribute(attribute) {
            await this.performApiCall('POST', '/api/attributes', attribute, (data) => {
                this.handleAttributeCreation(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, 'Failed to create attribute');
        },

        async createAttributeValue(attributeValue) {
            await this.performApiCall('POST', '/api/attribute-values', attributeValue, (data) => {
                this.handleAttributeValueCreation(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, 'Failed to create attribute value');
        },

        async updateAttribute(id, attribute) {
            await this.performApiCall('PUT', `/api/attributes/${id}`, attribute, (data) => {
                this.handleAttributeUpdate(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update attribute with ID: ${id}`);
        },

        async updateAttributeValue(id, attributeValue) {
            await this.performApiCall('PUT', `/api/attribute-values/${id}`, attributeValue, (data) => {
                this.handleAttributeValueUpdate(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update attribute value with ID: ${id}`);
        },

        async deleteAttribute(id) {
            await this.performApiCall('DELETE', `/api/attributes/${id}`, null, (data) => {
                this.handleAttributeDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message);
                }
            }, `Failed to delete attribute with ID: ${id}`);
        },

        async deleteAttributeValue(id) {
            await this.performApiCall('DELETE', `/api/attribute-values/${id}`, null, (data) => {
                this.handleAttributeValueDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message);
                }
            }, `Failed to delete attribute value with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateAttribute(attribute) {
            this.handleAttributeUpdate(attribute);
        },

        socketCreateAttribute(attribute) {
            this.handleAttributeCreation(attribute);
        },

        socketDeleteAttribute(id) {
            this.handleAttributeDeletion(id);
        },

        socketUpdateAttributeValue(attribute) {
            this.handleAttributeValueUpdate(attribute);
        },

        socketCreateAttributeValue(attribute) {
            this.handleAttributeValueCreation(attribute);
        },

        socketDeleteAttributeValue(id) {
            this.handleAttributeValueDeletion(id);
        },

        // Utility functions
        setLoading(isLoading) {
            this.loading = isLoading;
        },

        async performApiCall(method, endpoint, body, onSuccess, errorMessage) {
            this.setLoading(true);
            this.error = null;
            const config = useRuntimeConfig();
            const socketId = useState('socketId').value;
            const apiUrl = `${config.public.baseURL}${endpoint}`;

            console.log('API Call:', { method, endpoint, body, apiUrl });

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method,
                    body,
                    credentials: 'include',
                    headers: {
                        'x-socket-id': socketId,
                    },
                });

                console.log('API Response:',  error);

                if (error.value) {
                    // Handle network errors
                    if (error.value.status === 400) {
                        throw new Error('Invalid input. Please check your data and try again.');
                    } else if (error.value.status === 404) {
                        throw new Error('The requested resource was not found.');
                    } else if (error.value.status === 500) {
                        throw new Error('An internal server error occurred. Please try again later.');
                    } else if (error.value.data.message) {
                        throw new Error(error.value.data.message);
                    } else {
                        throw new Error(errorMessage);
                    }
                }

                // Check if data is available before accessing it
                if (data.value && data.value.data) {
                    onSuccess(data.value);
                } else if (data.value && data.value.message) {
                    // Handle cases where only a message is returned (e.g., DELETE)
                    onSuccess(data.value);
                } else {
                    // Handle case where data is missing
                    console.error('No data received from API:', data.value);
                    this.error = 'No data received from API';
                    useNuxtApp().$toast.error('No data received from API');
                }
            } catch (error) {
                console.error(errorMessage, error);
                this.error = error.message;
                useNuxtApp().$toast.error(error.message || errorMessage);
            } finally {
                this.setLoading(false);
            }
        },

        handleAttributeUpdate(attribute) {
            if (attribute && attribute.id) {
                const index = this.attributes.findIndex(attr => attr.id === attribute.id);
                if (index !== -1) {
                    this.attributes.splice(index, 1, attribute);
                } else {
                    console.warn('Attribute not found for update:', attribute);
                }
            } else {
                console.warn('Invalid attribute data received for update:', attribute);
            }
        },

        handleAttributeCreation(attribute) {
            if (attribute && attribute.id && !this.attributes.some(attr => attr.id === attribute.id)) {
                this.attributes.push(attribute);
            } else {
                console.warn('Invalid attribute data received for creation or duplicate found:', attribute);
            }
        },

        handleAttributeDeletion(id) {
            const attributeId = parseInt(id, 10);
            if (!isNaN(attributeId)) {
                const originalAttributesLength = this.attributes.length;
                this.attributes = this.attributes.filter(attribute => attribute.id !== attributeId);
                if (this.attributes.length < originalAttributesLength) {
                    console.log('Attribute Deleted via Socket');
                } else {
                    console.warn('Attribute ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid attribute ID received for deletion:', id);
            }
        },

        handleAttributeValueUpdate(attributeValue) {
            if (attributeValue && attributeValue.id) {
                const index = this.attributeValues.findIndex(value => value.id === attributeValue.id);
                if (index !== -1) {
                    this.attributeValues.splice(index, 1, attributeValue);
                } else {
                    console.warn('Attribute Value not found for update:', attributeValue);
                }
            } else {
                console.warn('Invalid attribute value data received for update:', attributeValue);
            }
        },

        handleAttributeValueCreation(attributeValue) {
            if (attributeValue && attributeValue.id && !this.attributeValues.some(value => value.id === attributeValue.id)) {
                this.attributeValues.push(attributeValue);
            } else {
                console.warn('Invalid attribute value data received for creation or duplicate found:', attributeValue);
            }
        },

        handleAttributeValueDeletion(id) {
            const attributeValueId = parseInt(id, 10);
            if (!isNaN(attributeValueId)) {
                const originalAttributeValuesLength = this.attributeValues.length;
                this.attributeValues = this.attributeValues.filter(attributeValue => attributeValue.id !== attributeValueId);
                if (this.attributeValues.length < originalAttributeValuesLength) {
                    console.log('Attribute Value Deleted via Socket');
                } else {
                    console.warn('Attribute Value ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid attribute value ID received for deletion:', id);
            }
        },
    },
});