// stores/productStore.js
import { defineStore } from 'pinia';
import { useRuntimeConfig } from '#app';
export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        product: null,
        attributes: [],
        attributeValues: [],
        variants: [],
        error: null,
    }),
    getters: {
        productById: (state) => (id) => state.products.find(product => product.id === id) || null,
        attributesByProductId: (state) => (productId) => state.attributes.filter(attr => attr.productId === productId),
        variantsByProductId: (state) => (productId) => state.variants.filter(variant => variant.productId === productId),
    },
    actions: {
        async fetchProducts() {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/products';
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.products = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching products:', err);
                $toast.error('Error fetching products')
            }
        },
        async fetchProduct(id) {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + `/api/products/${id}`;
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.product = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching product:', err);
                $toast.error('Error fetching product')
            }
        },
        async createProduct(product) {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/products';
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: product,
                });
                if (error.value) throw error.value;
                this.products.push(data.value);
                $toast.success('Product Created')
            } catch (err) {
                this.error = err;
                console.error('Error creating product:', err);
                $toast.error('Error creating product')
            }
        },
        async updateProduct(id, updatedProduct) {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + `/api/products/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: updatedProduct,
                });
                if (error.value) throw error.value;
                const index = this.products.findIndex(product => product.id === id);
                if (index !== -1) {
                    this.products[index] = data.value;
                }
                $toast.success('Product Updated')
            } catch (err) {
                this.error = err;
                console.error('Error updating product:', err);
                $toast.error('Error updating product')
            }
        },
        async deleteProduct(id) {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + `/api/products/${id}`;
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });
                if (error.value) throw error.value;
                this.products = this.products.filter(product => product.id !== id);
                $toast.warning('Product Deleted')
            } catch (err) {
                this.error = err;
                console.error('Error deleting product:', err);
                $toast.error('Error deleting product')
            }
        },
        async fetchAttributes() {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/attributes';
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.attributes = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching attributes:', err);
                $toast.error('Error fetching attributes')
            }
        },
        async fetchAttributeValues() {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/attribute-values';
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.attributeValues = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching attribute values:', err);
                $toast.error('Error fetching attribute values')
            }
        },
        async fetchVariants() {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/variants';
                const { data, error } = await useFetch(apiUrl);
                if (error.value) throw error.value;
                this.variants = data.value;
            } catch (err) {
                this.error = err;
                console.error('Error fetching variants:', err);
                $toast.error('Error fetching variants')
            }
        },
        async createVariant(variant) {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + '/api/variants';
                const { data, error } = await useFetch(apiUrl, {
                    method: 'POST',
                    body: variant,
                });
                if (error.value) throw error.value;
                this.variants.push(data.value);
                $toast.success('Variant Created')
            } catch (err) {
                this.error = err;
                console.error('Error creating variant:', err);
                $toast.error('Error creating variant')
            }
        },
        async updateVariant(id, updatedVariant) {
            const { $toast } = useNuxtApp()
            try {
                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + `/api/variants/${id}`;
                const { data, error } = await useFetch(apiUrl, {
                    method: 'PUT',
                    body: updatedVariant,
                });
                if (error.value) throw error.value;
                const index = this.variants.findIndex(variant => variant.id === id);
                if (index !== -1) {
                    this.variants[index] = data.value;
                }
                $toast.success('Variant Updated')
            } catch (err) {
                this.error = err;
                console.error('Error updating variant:', err);
                $toast.error('Error updating variant')
            }
        },
        async deleteVariant(id) {
            const { $toast } = useNuxtApp()
            try {

                const config = useRuntimeConfig();
                const apiUrl = config.public.baseURL + `/api/variants/${id}`;
                const { error } = await useFetch(apiUrl, {
                    method: 'DELETE',
                });
                if (error.value) throw error.value;
                this.variants = this.variants.filter(variant => variant.id !== id);
                $toast.success('Variant Deleted')
            } catch (err) {
                this.error = err;
                console.error('Error deleting variant:', err);
                $toast.error('Error deleting variant')
            }
        },
    },
});

