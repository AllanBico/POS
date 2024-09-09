// plugins/socket.io.client.ts
import { io } from "socket.io-client";
import { useRuntimeConfig } from '#app';
import {useCategoryStore} from '~/stores/category.js';
export default defineNuxtPlugin((nuxtApp) => {
    const categoryStore = useCategoryStore();
    const config = useRuntimeConfig();
    const socketUrl = config.public.baseURL ;
    const socket = io(socketUrl, {
        transports: ['websocket'], // Explicitly specify WebSocket transport
    });
    socket.on('connect', () => {
        console.log('Connected to the Socket.IO server');
    });
    socket.on('newCategory', async (category) => {
        await categoryStore.socketCreateCategory(category)
    });
    socket.on('updateCategory', async (category) => {
        await categoryStore.socketUpdateCategory(category)
    });
    socket.on('deleteCategory', async (id) => {
        await categoryStore.socketDeleteCategory(parseInt(id))
    });

    nuxtApp.provide ("socket", socket);
});
