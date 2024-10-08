import { useWarrantyStore } from '~/stores/product/WarrantyStore.js';

export const setupWarrantyHandlers = (socket) => {
    const warrantyStore = useWarrantyStore();

    const safeParseInt = (value) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
    };

    // Listening for socket emits
    socket.on('newWarranty', async (warranty) => {
        console.log('Received newWarranty event with data:', warranty); // Log for debugging
        if (warranty && typeof warranty === 'object') {
            await warrantyStore.socketCreateWarranty(warranty);
            console.log('Warranty created successfully:', warranty); // Log for debugging
        } else {
            console.warn('Invalid warranty data received:', warranty);
        }
    });

    socket.on('updateWarranty', async (warranty) => {
        if (warranty && typeof warranty === 'object') {
            await warrantyStore.socketUpdateWarranty(warranty);
        } else {
            console.warn('Invalid warranty data received for update:', warranty);
        }
    });

    socket.on('deleteWarranty', async (id) => {
        const warrantyId = safeParseInt(id);
        if (warrantyId !== null) {
            await warrantyStore.socketDeleteWarranty(warrantyId);
        } else {
            console.warn('Invalid warranty ID received for deletion:', id);
        }
    });
};
