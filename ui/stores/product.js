import {defineStore} from 'pinia';
import {useRuntimeConfig} from '#app';

export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        product: null,
        attributes: [],
        attributeValues: [],
        variants: [],
        variantAttributeValues: [],
        error: null,
    }),
    getters: {
        /**
         * Returns the product with the given ID from the state.
         *
         * @param {Object} state - The state object.
         * @return {Object|null} The product with the given ID, or null if not found.
         */
        productById: (state) => (id) => state.products.find(product => product.id === id) || null,
        attributesByProductId: (state) => (productId) => state.attributes.filter(attr => attr.productId === productId),
        variantsByProductId: (state) => (productId) => state.variants.filter(variant => variant.productId === productId),
        attributeValuesByAttributeId: (state) => (attributeId) => state.attributeValues.filter(value => value.attributeId === attributeId),
    },
    actions: {
        /**
         * Fetches a list of products from the API.
         *
         * @return {Promise<void>} Resolves when the products have been fetched and stored in the state.
         */
        async fetchProducts() {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/products`;
                const {data, error} = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.products = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching products:', err);
                $toast.error('Error fetching products');
            }
        },

        async fetchProduct(id) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/products/${id}`;
                const {data, error} = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.product = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching product:', err);
                $toast.error('Error fetching product');
            }
        },

        async fetchAttributes() {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/attributes`;
                const {data, error} = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.attributes = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching attributes:', err);
                $toast.error('Error fetching attributes');
            }
        },

        async fetchAttributeValues() {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/attribute-values`;
                const {data, error} = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.attributeValues = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching attribute values:', err);
                $toast.error('Error fetching attribute values');
            }
        },

        async fetchVariants() {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variants`;
                const {data, error} = await useFetch(apiUrl, { credentials: 'include' });
                if (error.value) throw error.value;
                this.variants = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching variants:', err);
                $toast.error('Error fetching variants');
            }
        },

        async createProduct(product) {
            const {$toast} = useNuxtApp();
            if (!product || typeof product !== 'object') {
                throw new Error('Invalid product object');
            }

            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/products`;
                const {data, error} = await useFetch(apiUrl, {
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify(product),
                });
                if (error.value) {
                    console.log("error.value",error.value.data)
                    this.error = error.value;
                    throw error.value;
                }
                this.products.push(data.value);
                console.log("store product created",data.value)
                $toast.success('Product created successfully');
                return data.value
            } catch (err) {
                this.error = err;
                console.error('Error creating product:', err);
                $toast.error('Error creating product');
            }
        },

        async updateProduct(id, product) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/products/${id}`;
                const {data, error} = await useFetch(apiUrl, {
                    method: 'PUT',
                    credentials: 'include',
                    body: JSON.stringify(product),
                });
                if (error.value) throw error.value;
                const index = this.products.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.products[index] = data.value;
                }
                $toast.success('Product updated successfully');
            } catch (err) {
                this.error = err;
                console.error('Error updating product:', err);
                $toast.error('Error updating product');
            }
        },

        async deleteProduct(id) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/products/${id}`;
                const {data, error} = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.products = this.products.filter(product => product.id !== id);
                $toast.success('Product deleted successfully');
            } catch (err) {
                this.error = err;
                console.error('Error deleting product:', err);
                $toast.error('Error deleting product');
            }
        },

        async createVariant(variant) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variants`;
                const {data, error} = await useFetch(apiUrl, {
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify(variant),
                });
                if (error.value) throw error.value;
                this.variants.push(data.value);
                console.log("Variant store",data.value)
                $toast.success('Variant created successfully');

                return data.value
            } catch (err) {
                this.error = err;
                console.error('Error creating variant:', err);
                $toast.error('Error creating variant');
            }
        },

        async updateVariant(id, variant) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variants/${id}`;
                const {data, error} = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: JSON.stringify(variant),
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                const index = this.variants.findIndex(v => v.id === id);
                if (index !== -1) {
                    this.variants[index] = data.value;
                }
                $toast.success('Variant updated successfully');
            } catch (err) {
                this.error = err;
                console.error('Error updating variant:', err);
                $toast.error('Error updating variant');
            }
        },

        async deleteVariant(id) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variants/${id}`;
                const {data, error} = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.variants = this.variants.filter(variant => variant.id !== id);
                $toast.success('Variant deleted successfully');
            } catch (err) {
                this.error = err;
                console.error('Error deleting variant:', err);
                $toast.error('Error deleting variant');
            }
        },
        async fetchVariantAttributeValues() {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variant-attribute-values`;
                const {data, error} = await useFetch(apiUrl,{credentials: 'include'});
                if (error.value) throw error.value;
                this.variantAttributeValues = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching variant attribute values:', err);
                $toast.error('Error fetching variant attribute values');
            }
        },

        async fetchVariantAttributeValue(id) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variant-attribute-values/${id}`;
                const {data, error} = await useFetch(apiUrl,{credentials: 'include'});
                if (error.value) throw error.value;
                return data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching variant attribute value:', err);
                $toast.error('Error fetching variant attribute value');
            }
        },

        async createVariantAttributeValue(variantAttributeValue) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variant-attribute-values`;
                const {data, error} = await useFetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify(variantAttributeValue),
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.variantAttributeValues.push(data.value);
                $toast.success('Variant attribute value created successfully');
            } catch (err) {
                this.error = err;
                console.error('Error creating variant attribute value:', err);
                $toast.error('Error creating variant attribute value');
            }
        },

        async updateVariantAttributeValue(id, variantAttributeValue) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variant-attribute-values/${id}`;
                const {data, error} = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: JSON.stringify(variantAttributeValue),
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                const index = this.variantAttributeValues.findIndex(vav => vav.id === id);
                if (index !== -1) {
                    this.variantAttributeValues[index] = data.value;
                }
                $toast.success('Variant attribute value updated successfully');
            } catch (err) {
                this.error = err;
                console.error('Error updating variant attribute value:', err);
                $toast.error('Error updating variant attribute value');
            }
        },

        async deleteVariantAttributeValue(id) {
            const {$toast} = useNuxtApp();
            try {
                const config = useRuntimeConfig();
                const apiUrl = `${config.public.baseURL}/api/variant-attribute-values/${id}`;
                const {data, error} = await useFetch(apiUrl, {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (error.value) throw error.value;
                this.variantAttributeValues = this.variantAttributeValues.filter(vav => vav.id !== id);
                $toast.success('Variant attribute value deleted successfully');
            } catch (err) {
                this.error = err;
                console.error('Error deleting variant attribute value:', err);
                $toast.error('Error deleting variant attribute value');
            }
        },
    },
});
