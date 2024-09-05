import { setupSocketClient } from './socketClient';
import { setupSocketEvents } from './socketEvents';

export default defineNuxtPlugin((nuxtApp) => {
    const socket = setupSocketClient(); // Setup socket client
    setupSocketEvents(socket); // Setup socket event listeners

    // Provide the socket instance to the app
    nuxtApp.provide("socket", socket);
});
