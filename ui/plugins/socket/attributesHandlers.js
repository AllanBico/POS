import {useAttributesStore} from '~/stores/product/AttributeStore.js';
import {useBrandStore} from '~/stores/product/BrandStore.js';
import {useUnitStore} from '~/stores/product/UnitStore.js';
import {useWarrantyStore} from '~/stores/product/WarrantyStore.js';
import {useSupplierStore} from '~/stores/product/SupplierStore.js';

export const setupAttributesHandlers = (socket) => {
    const attributesStore = useAttributesStore();
    const brandStore = useBrandStore();
    const unitStore = useUnitStore();
    const warrantyStore = useWarrantyStore();
    const supplierStore = useSupplierStore();

    socket.on('newBrand', async (brand) => {
        await brandStore.socketCreateBrand(brand);
    });
    socket.on('updateBrand', async (brand) => {
        await brandStore.socketUpdateBrand(brand);
    });
    socket.on('deleteBrand', async (id) => {
        await brandStore.socketDeleteBrand(parseInt(id));
    });
    socket.on('newAttribute', async (attribute) => {
        await attributesStore.socketCreateAttribute(attribute);
    });
    socket.on('updateAttribute', async (attribute) => {
        await attributesStore.socketUpdateAttribute(attribute);
    });
    socket.on('deleteAttribute', async (id) => {
        await attributesStore.socketDeleteAttribute(parseInt(id));
    });
    socket.on('newAttributeValue', async (attribute) => {
        await attributesStore.socketCreateAttributeValue(attribute);
    });
    socket.on('updateAttributeValue', async (attribute) => {
        await attributesStore.socketUpdateAttributeValue(attribute);
    });
    socket.on('deleteAttributeValue', async (id) => {
        await attributesStore.socketDeleteAttributeValue(parseInt(id));
    });
    socket.on('newUnit', async (unit) => {
        await unitStore.socketCreateUnit(unit);
    });
    socket.on('updateUnit', async (unit) => {
        await unitStore.socketUpdateUnit(unit);
    });
    socket.on('deleteUnit', async (id) => {
        await unitStore.socketDeleteUnit(parseInt(id));
    });
    socket.on('newWarranty', async (warranty) => {
        await warrantyStore.socketCreateWarranty(warranty);
    });

    socket.on('updateWarranty', async (warranty) => {
        await warrantyStore.socketUpdateWarranty(warranty);
    });

    socket.on('deleteWarranty', async (id) => {
        await warrantyStore.socketDeleteWarranty(parseInt(id));
    });
    socket.on('newSupplier', async (supplier) => {
        await supplierStore.socketCreateSupplier(supplier);
    });

    socket.on('updateSupplier', async (supplier) => {
        await supplierStore.socketUpdateSupplier(supplier);
    });

    socket.on('deleteSupplier', async (id) => {
        await supplierStore.socketDeleteSupplier(parseInt(id));
    });
};
