import { useCategoryStore } from '~/stores/product/CategoryStore.js';
import {useSubcategoryStore} from '~/stores/product/SubcategoryStore.js'
export const setupCategoryHandlers = (socket) => {
    const categoryStore = useCategoryStore();
    const subCategoryStore = useSubcategoryStore();
    socket.on('newCategory', async (category) => {
        console.log("socket category",category)
        await categoryStore.socketCreateCategory(category);
    });

    socket.on('updateCategory', async (category) => {
        await categoryStore.socketUpdateCategory(category);
    });

    socket.on('deleteCategory', async (id) => {
        await categoryStore.socketDeleteCategory(parseInt(id));
    });
    socket.on('newSubcategory', async (subCategory) => {
        await subCategoryStore.socketCreateSubcategory(subCategory);
    });

    socket.on('updateSubcategory', async (subCategory) => {
        await subCategoryStore.socketUpdateSubcategory(subCategory);
    });
    socket.on('deleteSubcategory', async (id) => {
        await subCategoryStore.socketDeleteSubcategory(parseInt(id));
    });
};
