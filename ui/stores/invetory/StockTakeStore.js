import { defineStore } from 'pinia';

export const useStockTakeStore = defineStore('stockTake', {
  state: () => ({
    stockTakes: [],
    stockTake: null,
  }),
  getters: {
    StockTakeById: (state) => (id) => state.stockTakes.find(stockTake => stockTake.id === id) || null,
  },
  actions: {
    async fetchStockTakes() {
      const config = useRuntimeConfig();
      const apiUrl = `${config.public.baseURL}/api/stock-takes`;
      const { data } = await useFetch(apiUrl,{credentials: 'include'});
      this.stockTakes = data.value;
    },

    async createStockTake(stockTakeData) {
      const config = useRuntimeConfig();
      const apiUrl = `${config.public.baseURL}/api/stock-takes`;
      const { data, error } = await useFetch(apiUrl, {
        method: 'POST',
        body: stockTakeData,
        credentials: 'include',
      });
      this.stockTakes.push(data.value);
    },

    async updateStockTake(id, stockTakeData) {
      const config = useRuntimeConfig();
      const apiUrl = `${config.public.baseURL}/api/stock-takes/${id}`;
      const { data, error } = await useFetch(apiUrl, {
        method: 'PUT',
        body: stockTakeData,
        credentials: 'include',
      });
      const index = this.stockTakes.findIndex((stockTake) => stockTake.id === id);
      if (index !== -1) {
        this.stockTakes[index] = data.value;
      }
    },
    async stockTakeForm(formData) {
      console.log("formData",formData)
      const config = useRuntimeConfig();
      const apiUrl = `${config.public.baseURL}/api/stock-takes/products`;

      const { data, error } = await useFetch(apiUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      console.log("stock take data",data.value)
      return data.value;
    },

    async deleteStockTake(id) {
      const config = useRuntimeConfig();
      const apiUrl = `${config.public.baseURL}/api/stock-takes/${id}`;
      const { data, error } = await useFetch(apiUrl, {
        method: 'DELETE',
        credentials: 'include',
      });
      this.stockTakes = this.stockTakes.filter((stockTake) => stockTake.id !== id);
    },
  },
});
