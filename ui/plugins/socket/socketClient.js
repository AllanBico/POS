import { io } from 'socket.io-client';
import { useState } from '#app'; // Import Nuxt's useState composable

export const setupSocketClient = () => {
    const config = useRuntimeConfig();
    const socketUrl = config.public.baseURL;

    // Create and configure the Socket.IO client instance
    const socket = io(socketUrl, {
        transports: ['websocket'], // Use WebSocket transport
        auth: {
            token: useCookie('token').value // Extract the value of the token
        },
    });

    // Save the socket ID into the global state when the connection is established
    socket.on('connect', () => {
        console.log('Connected to the Socket.IO server', socket.id);

        // Use `useState` to store the socketId globally in Nuxt
        const socketId = useState('socketId', () => socket.id);
        socketId.value = socket.id; // Save the socket id
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from the Socket.IO server');
    });

    return socket;
};
