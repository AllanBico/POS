import { useCategoryStore } from '~/stores/product/CategoryStore.js';
import { useSubcategoryStore } from '~/stores/product/SubcategoryStore.js';

export const setupCategoryHandlers = (socket) => {
    const categoryStore = useCategoryStore();
    const subCategoryStore = useSubcategoryStore();

    const safeParseInt = (value) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
    };

    const handleSocketEvent = (eventName, handler) => {
        socket.on(eventName, async (data) => {
            try {
                console.log(`${eventName} received:`, data);
                await handler(data);
            } catch (error) {
                console.error(`Error handling ${eventName}:`, error);
            }
        });
    };

    // Listening for socket emits
    socket.on('newCategory', async (category) => {
        console.log('Received newCategory event with data:', category); // Log for debugging
        if (category && typeof category === 'object') {
            await categoryStore.socketCreateCategory(category);
            console.log('Category created successfully:', category); // Log for debugging
        } else {
            console.warn('Invalid category data received:', category);
        }
    });

    socket.on('updateCategory', async (category) => {
        if (category && typeof category === 'object') {
            await categoryStore.socketUpdateCategory(category);
        } else {
            console.warn('Invalid category data received for update:', category);
        }
    });

    socket.on('deleteCategory', async (id) => {
        const categoryId = safeParseInt(id);
        if (categoryId !== null) {
            await categoryStore.socketDeleteCategory(categoryId);
        } else {
            console.warn('Invalid category ID received for deletion:', id);
        }
    });

    socket.on('newSubcategory', async (subCategory) => {
        if (subCategory && typeof subCategory === 'object') {
            await subCategoryStore.socketCreateSubcategory(subCategory);
        } else {
            console.warn('Invalid subcategory data received:', subCategory);
        }
    });

    socket.on('updateSubcategory', async (subCategory) => {
        if (subCategory && typeof subCategory === 'object') {
            await subCategoryStore.socketUpdateSubcategory(subCategory);
        } else {
            console.warn('Invalid subcategory data received for update:', subCategory);
        }
    });

    socket.on('deleteSubcategory', async (id) => {
        const subCategoryId = safeParseInt(id);
        if (subCategoryId !== null) {
            await subCategoryStore.socketDeleteSubcategory(subCategoryId);
        } else {
            console.warn('Invalid subcategory ID received for deletion:', id);
        }
    });
};
