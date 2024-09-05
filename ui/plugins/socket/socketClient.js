import { io } from 'socket.io-client';
import { useRuntimeConfig } from '#app';

export const setupSocketClient = () => {
    const config = useRuntimeConfig();
    const socketUrl = config.public.baseURL;

    // Create and configure the Socket.IO client instance
    const socket = io(socketUrl, {
        transports: ['websocket'], // Use WebSocket transport
    });

    socket.on('connect', () => {
        console.log('Connected to the Socket.IO server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from the Socket.IO server');
    });

    return socket;
};
