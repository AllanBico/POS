import { defineStore } from 'pinia';
import { useRuntimeConfig, useNuxtApp, useState } from '#app';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        product: null,
        attributes: [],
        attributeValues: [],
        variants: [],
        variantAttributeValues: [],
        error: null,
        compositions: [],
        composition: null,
        loading: false,
        priceRules: [], // Add price rules to the state
    }),
    getters: {
        /**
         * Returns the product with the given ID from the state.
         *
         * @param {Object} state - The state object.
         * @return {Object|null} The product with the given ID, or null if not found.
         */
        productById: (state) => (id) => state.products.find(product => product.id === id) || null,
        compositionById: (state) => (id) => state.compositions.find(composition => composition.id === id) || null,
        variantById: (state) => (id) => {
            const variant = state.variants.find(variant => variant.id === id) || null;
            return variant;
        },
        priceRuleById: (state) => (id) => state.priceRules.find(rule => rule.id === id) || null,
        attributesByProductId: (state) => (productId) => state.attributes.filter(attr => attr.productId === productId),
        variantsByProductId: (state) => (productId) => state.variants.filter(variant => variant.productId === productId),
        attributeValuesByAttributeId: (state) => (attributeId) => state.attributeValues.filter(value => value.attributeId === attributeId),
    },
    actions: {
        setLoading(loading) {
            this.loading = loading;
        },
        search(term) {
            if (!term) {
                this.searchResults = [];
                return;
            }

            const searchTerms = term.toLowerCase().split(/\s+/);

            this.searchResults = this.variants?.filter((variant) => {
                const product = this.products?.find(product => product.id === variant?.productId);

                const searchableFields = [
                    variant?.sku,
                    variant?.code,
                    variant?.partNumber,
                    variant?.description,
                    product?.name
                ].filter(Boolean).map(field => field.toLowerCase());

                return searchTerms.every(term =>
                    searchableFields.some(field => field.includes(term))
                );
            }) || [];

            // Sort results by relevance
            this.searchResults.sort((a, b) => {
                const aRelevance = this.calculateRelevance(a, searchTerms);
                const bRelevance = this.calculateRelevance(b, searchTerms);
                return bRelevance - aRelevance;
            });
            return this.searchResults;
        },

        calculateRelevance(variant, searchTerms) {
            const product = this.products?.find(product => product.id === variant?.productId);
            const searchableFields = [
                variant?.sku,
                variant?.code,
                variant?.partNumber,
                variant?.description,
                product?.name
            ].filter(Boolean).map(field => field.toLowerCase());

            return searchTerms.reduce((relevance, term) => {
                const fieldMatches = searchableFields.filter(field => field.includes(term)).length;
                return relevance + fieldMatches;
            }, 0);
        },
        /**
         * Fetches a list of products from the API.
         *
         * @return {Promise<void>} Resolves when the products have been fetched and stored in the state.
         */
        async fetchProducts() {
            await this.performApiCall('GET', '/api/products', null, (data) => {
                this.products = data.data.value;
            }, 'Failed to fetch products');
        },

        async fetchProduct(id) {
            await this.performApiCall('GET', `/api/products/${id}`, null, (data) => {
                this.product = data.data.value;
            }, `Failed to fetch product with ID: ${id}`);
        },

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

        async fetchVariants() {
            await this.performApiCall('GET', '/api/variants', null, (data) => {
                this.variants = data.data.value;
            }, 'Failed to fetch variants');
        },

        async createProduct(product) {
            await this.performApiCall('POST', '/api/products', product, (data) => {
                this.handleProductCreation(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, 'Failed to create product');
        },
        async uploadImage(variantId, file) {
            const { $toast } = useNuxtApp();
            this.loading = true;
            this.error = null;

            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variant-images/`;
                const formData = new FormData();
                formData.append('image', file);
                console.log('image', file);
                formData.append('variantId', variantId);

                const { data } = await $fetch(apiUrl, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });
            } catch (error) {
                this.error = error;
                console.error('Error uploading image:', error);
                $toast.error('Error uploading image');
            } finally {
                this.loading = false;
            }
        },
        async updateProduct(id, product) {
            await this.performApiCall('PUT', `/api/products/${id}`, product, (data) => {
                this.handleProductUpdate(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update product with ID: ${id}`);
        },

        async deleteProduct(id) {
            await this.performApiCall('DELETE', `/api/products/${id}`, null, (data) => {
                this.handleProductDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message);
                }
            }, `Failed to delete product with ID: ${id}`);
        },

        async fetchVariantAttributeValues() {
            await this.performApiCall('GET', '/api/variant-attribute-values', null, (data) => {
                this.variantAttributeValues = data.data.value;
            }, 'Failed to fetch variant attribute values');
        },

        async createVariant(variant) {
            await this.performApiCall('POST', '/api/variants', variant, (data) => {
                this.handleVariantCreation(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, 'Failed to create variant');
        },

        async updateVariant(id, variant) {
            await this.performApiCall('PUT', `/api/variants/${id}`, variant, (data) => {
                this.handleVariantUpdate(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update variant with ID: ${id}`);
        },

        async deleteVariant(id) {
            await this.performApiCall('DELETE', `/api/variants/${id}`, null, (data) => {
                this.handleVariantDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message);
                }
            }, `Failed to delete variant with ID: ${id}`);
        },

        async fetchCompositions() {
            await this.performApiCall('GET', '/api/compositions', null, (data) => {
                this.compositions = data.data.value;
            }, 'Failed to fetch compositions');
        },

        async fetchComposition(id) {
            await this.performApiCall('GET', `/api/compositions/variant/${id}`, null, (data) => {
                this.compositions = data.data.value;
            }, `Failed to fetch composition with ID: ${id}`);
        },

        async createComposition(productVariantId, ingredients) {
            const composition = { productVariantId, ingredients };
            console.log('composition', composition);
            await this.performApiCall('POST', '/api/compositions', composition, (data) => {
                console.log('data.data.value', data.data.value)
                this.handleCompositionCreation(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, 'Failed to create composition');
        },

        async updateComposition(id, composition) {
            await this.performApiCall('PUT', `/api/compositions/${id}`, composition, (data) => {
                this.handleCompositionUpdate(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update composition with ID: ${id}`);
        },

        async deleteComposition(compositionId) {
            await this.performApiCall('DELETE', `/api/compositions/${compositionId}`, null, (data) => {
                this.handleCompositionDeletion(compositionId);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message);
                }
            }, `Failed to delete composition with ID: ${compositionId}`);
        },
        async updateCompositionQuantity(compositionId, newQuantity) {
            await this.performApiCall('PUT', `/api/compositions/${compositionId}`, { quantity: newQuantity }, (data) => {
                this.handleCompositionQuantityUpdate(compositionId, newQuantity);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update composition quantity with ID: ${compositionId}`);
        },

        // Price Rule Actions
        async fetchPriceRules(id) {
            await this.performApiCall('GET', `/api/price-rules/variant/${id}`, null, (data) => {
                console.log('data.data.value store', data.data)
                this.priceRules = data.data;
            }, 'Failed to fetch price rules');
        },

        async createPriceRule(priceRule) {
            await this.performApiCall('POST', '/api/price-rules', priceRule, (data) => {
                this.handlePriceRuleCreation(data.data.value);
                if (data.message) {
                    useNuxtApp().$toast.success(data.message);
                }
            }, 'Failed to create price rule');
        },

        async updatePriceRule(id, priceRule) {
            await this.performApiCall('PUT', `/api/price-rules/${id}`, priceRule, (data) => {
                this.handlePriceRuleUpdate(data.data.value);
                if (data.message) {
                    console.log('data.message',data.message)
                    useNuxtApp().$toast.success(data.message);
                }
            }, `Failed to update price rule with ID: ${id}`);
        },

        async deletePriceRule(id) {
            await this.performApiCall('DELETE', `/api/price-rules/${id}`, null, (data) => {
                this.handlePriceRuleDeletion(id);
                if (data.message) {
                    useNuxtApp().$toast.warning(data.message);
                }
            }, `Failed to delete price rule with ID: ${id}`);
        },

        // Socket event handlers
        socketUpdateProduct(product) {
            this.handleProductUpdate(product);
        },

        socketCreateProduct(product) {
            this.handleProductCreation(product);
        },

        socketDeleteProduct(id) {
            this.handleProductDeletion(id);
        },

        socketUpdateVariant(variant) {
            this.handleVariantUpdate(variant);
        },

        socketCreateVariant(variant) {
            this.handleVariantCreation(variant);
        },

        socketDeleteVariant(id) {
            this.handleVariantDeletion(id);
        },

        socketUpdateVariantAttributeValue(variantAttributeValue) {
            this.handleVariantAttributeValueUpdate(variantAttributeValue);
        },

        socketCreateVariantAttributeValue(variantAttributeValue) {
            this.handleVariantAttributeValueCreation(variantAttributeValue);
        },

        socketDeleteVariantAttributeValue(id) {
            this.handleVariantAttributeValueDeletion(id);
        },

        socketUpdateComposition(composition) {
            this.handleCompositionUpdate(composition);
        },

        socketCreateComposition(composition) {
            this.handleCompositionCreation(composition);
        },

        socketDeleteComposition(id) {
            this.handleCompositionDeletion(id);
        },

        socketUpdateCompositionQuantity(compositionId, newQuantity) {
            this.handleCompositionQuantityUpdate(compositionId, newQuantity);
        },

        socketUpdatePriceRule(priceRule) {
            this.handlePriceRuleUpdate(priceRule);
        },

        socketCreatePriceRule(priceRule) {
            this.handlePriceRuleCreation(priceRule);
        },

        socketDeletePriceRule(id) {
            this.handlePriceRuleDeletion(id);
        },

        // Utility functions
        async performApiCall(method, endpoint, body, onSuccess, errorMessage) {
            this.setLoading(true);
            this.error = null;
            const config = useRuntimeConfig();
            const socketId = useState('socketId').value;
            const apiUrl = `${config.public.baseURL}${endpoint}`;

            console.log('API Call:', { method, endpoint, body, apiUrl }); // Log for debugging

            try {
                const { data, error } = await useFetch(apiUrl, {
                    method,
                    body,
                    credentials: 'include',
                    headers: {
                        'x-socket-id': socketId,
                    },
                });

                console.log('API Response:', data,error); // Log for debugging

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

        handleProductUpdate(product) {
            if (product && product.id) {
                const index = this.products.findIndex(p => p.id === product.id);
                if (index !== -1) {
                    this.products.splice(index, 1, product); // Replace the existing product with the updated one
                } else {
                    console.warn('Product not found for update:', product);
                }
            } else {
                console.warn('Invalid product data received for update:', product);
            }
        },

        handleProductCreation(product) {
            if (product && product.id && !this.products.some(p => p.id === product.id)) {
                this.products.push(product);
            } else {
                console.warn('Invalid product data received for creation or duplicate found:', product);
            }
        },

        handleProductDeletion(id) {
            const productId = parseInt(id, 10);
            if (!isNaN(productId)) {
                const originalProductsLength = this.products.length;
                this.products = this.products.filter(product => product.id !== productId);
                if (this.products.length < originalProductsLength) {
                    console.log('Product Deleted via Socket');
                } else {
                    console.warn('Product ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid product ID received for deletion:', id);
            }
        },

        handleVariantUpdate(variant) {
            if (variant && variant.id) {
                const index = this.variants.findIndex(v => v.id === variant.id);
                if (index !== -1) {
                    this.variants.splice(index, 1, variant);
                } else {
                    console.warn('Variant not found for update:', variant);
                }
            } else {
                console.warn('Invalid variant data received for update:', variant);
            }
        },

        handleVariantCreation(variant) {
            if (variant && variant.id && !this.variants.some(v => v.id === variant.id)) {
                this.variants.push(variant);
            } else {
                console.warn('Invalid variant data received for creation or duplicate found:', variant);
            }
        },

        handleVariantDeletion(id) {
            const variantId = parseInt(id, 10);
            if (!isNaN(variantId)) {
                const originalVariantsLength = this.variants.length;
                this.variants = this.variants.filter(variant => variant.id !== variantId);
                if (this.variants.length < originalVariantsLength) {
                    console.log('Variant Deleted via Socket');
                } else {
                    console.warn('Variant ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid variant ID received for deletion:', id);
            }
        },

        handleVariantAttributeValueUpdate(variantAttributeValue) {
            if (variantAttributeValue && variantAttributeValue.id) {
                const index = this.variantAttributeValues.findIndex(vav => vav.id === variantAttributeValue.id);
                if (index !== -1) {
                    this.variantAttributeValues.splice(index, 1, variantAttributeValue);
                } else {
                    console.warn('Variant attribute value not found for update:', variantAttributeValue);
                }
            } else {
                console.warn('Invalid variant attribute value data received for update:', variantAttributeValue);
            }
        },

        handleVariantAttributeValueCreation(variantAttributeValue) {
            if (variantAttributeValue && variantAttributeValue.id && !this.variantAttributeValues.some(vav => vav.id === variantAttributeValue.id)) {
                this.variantAttributeValues.push(variantAttributeValue);
            } else {
                console.warn('Invalid variant attribute value data received for creation or duplicate found:', variantAttributeValue);
            }
        },

        handleVariantAttributeValueDeletion(id) {
            const variantAttributeValueId = parseInt(id, 10);
            if (!isNaN(variantAttributeValueId)) {
                const originalVariantAttributeValuesLength = this.variantAttributeValues.length;
                this.variantAttributeValues = this.variantAttributeValues.filter(vav => vav.id !== variantAttributeValueId);
                if (this.variantAttributeValues.length < originalVariantAttributeValuesLength) {
                    console.log('Variant Attribute Value Deleted via Socket');
                } else {
                    console.warn('Variant Attribute Value ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid variant attribute value ID received for deletion:', id);
            }
        },

        handleCompositionUpdate(composition) {
            if (composition && composition.id) {
                const index = this.compositions.findIndex(comp => comp.id === composition.id);
                if (index !== -1) {
                    this.compositions.splice(index, 1, composition);
                } else {
                    console.warn('Composition not found for update:', composition);
                }
            } else {
                console.warn('Invalid composition data received for update:', composition);
            }
        },

        handleCompositionCreation(composition) {

            composition.forEach(comp => {
                if (comp && comp.id && !this.compositions.some(existingComp => existingComp.id === comp.id)) {
                    this.compositions.push(comp);
                } else {
                    console.warn('Invalid composition data received for creation or duplicate found:', comp);
                }
            });

        },

        handleCompositionDeletion(id) {
            const compositionId = parseInt(id, 10);
            if (!isNaN(compositionId)) {
                const originalCompositionsLength = this.compositions.length;
                this.compositions = this.compositions.filter(composition => composition.id !== compositionId);
                if (this.compositions.length < originalCompositionsLength) {
                    console.log('Composition Deleted via Socket');
                } else {
                    console.warn('Composition ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid composition ID received for deletion:', id);
            }
        },

        handleCompositionQuantityUpdate(compositionId, newQuantity) {
            if (!isNaN(compositionId)) {
                const index = this.compositions.findIndex(comp => comp.id === compositionId);
                if (index !== -1) {
                    this.compositions[index] = { ...this.compositions[index], quantity: newQuantity };
                } else {
                    console.warn('Composition not found for quantity update:', compositionId);
                }
            } else {
                console.warn('Invalid composition ID received for quantity update:', compositionId);
            }
        },

        handlePriceRuleUpdate(priceRule) {
            if (priceRule && priceRule.id) {
                const index = this.priceRules.findIndex(pr => pr.id === priceRule.id);
                if (index !== -1) {
                    this.priceRules.splice(index, 1, priceRule);
                } else {
                    console.warn('Price rule not found for update:', priceRule);
                }
            } else {
                console.warn('Invalid price rule data received for update:', priceRule);
            }
        },

        handlePriceRuleCreation(priceRule) {
            console.log('priceRule', priceRule)
            if (priceRule && priceRule.id && !this.priceRules.some(pr => pr.id === priceRule.id)) {
                this.priceRules.push(priceRule);
            } else {
                console.warn('Invalid price rule data received for creation or duplicate found:', priceRule);
            }
        },

        handlePriceRuleDeletion(id) {
            const priceRuleId = parseInt(id, 10);
            if (!isNaN(priceRuleId)) {
                const originalPriceRulesLength = this.priceRules.length;
                this.priceRules = this.priceRules.filter(priceRule => priceRule.id !== priceRuleId);
                if (this.priceRules.length < originalPriceRulesLength) {
                    console.log('Price Rule Deleted via Socket');
                } else {
                    console.warn('Price Rule ID not found for deletion:', id);
                }
            } else {
                console.warn('Invalid price rule ID received for deletion:', id);
            }
        },
    },
});