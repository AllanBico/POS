import { setupCategoryHandlers } from './categoryHandlers';
import {setupAttributesHandlers} from './attributesHandlers.js'

export const setupSocketEvents = (socket) => {
    // Set up category-related socket event listeners
    setupCategoryHandlers(socket);
    setupAttributesHandlers(socket);


};
