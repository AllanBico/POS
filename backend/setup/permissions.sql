-- Assuming you have a predefined list of model_ids based on your previous insertions.

-- Create CRUD permissions for each model
INSERT INTO Permissions (name, model_id, created_at, updated_at) VALUES
-- attribute
('create', (SELECT id FROM Models WHERE name = 'attribute'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'attribute'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'attribute'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'attribute'), NOW(), NOW()),
-- attribute value
('create', (SELECT id FROM Models WHERE name = 'attribute value'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'attribute value'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'attribute value'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'attribute value'), NOW(), NOW()),
-- category
('create', (SELECT id FROM Models WHERE name = 'category'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'category'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'category'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'category'), NOW(), NOW()),
-- customer
('create', (SELECT id FROM Models WHERE name = 'customer'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'customer'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'customer'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'customer'), NOW(), NOW()),
-- expense
('create', (SELECT id FROM Models WHERE name = 'expense'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'expense'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'expense'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'expense'), NOW(), NOW()),
-- expense category
('create', (SELECT id FROM Models WHERE name = 'expense category'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'expense category'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'expense category'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'expense category'), NOW(), NOW()),
-- good receiving
('create', (SELECT id FROM Models WHERE name = 'good receiving'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'good receiving'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'good receiving'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'good receiving'), NOW(), NOW()),
-- inventory
('create', (SELECT id FROM Models WHERE name = 'inventory'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'inventory'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'inventory'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'inventory'), NOW(), NOW()),
-- payment methods
('create', (SELECT id FROM Models WHERE name = 'payment methods'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'payment methods'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'payment methods'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'payment methods'), NOW(), NOW()),
-- products
('create', (SELECT id FROM Models WHERE name = 'products'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'products'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'products'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'products'), NOW(), NOW()),
-- purchase order
('create', (SELECT id FROM Models WHERE name = 'purchase order'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'purchase order'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'purchase order'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'purchase order'), NOW(), NOW()),
-- serial number
('create', (SELECT id FROM Models WHERE name = 'serial number'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'serial number'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'serial number'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'serial number'), NOW(), NOW()),
-- stock movement
('create', (SELECT id FROM Models WHERE name = 'stock movement'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'stock movement'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'stock movement'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'stock movement'), NOW(), NOW()),
-- stores
('create', (SELECT id FROM Models WHERE name = 'stores'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'stores'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'stores'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'stores'), NOW(), NOW()),
-- subcategory
('create', (SELECT id FROM Models WHERE name = 'subcategory'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'subcategory'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'subcategory'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'subcategory'), NOW(), NOW()),
-- supplier
('create', (SELECT id FROM Models WHERE name = 'supplier'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'supplier'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'supplier'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'supplier'), NOW(), NOW()),
-- permissions
('create', (SELECT id FROM Models WHERE name = 'permissions'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'permissions'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'permissions'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'permissions'), NOW(), NOW()),
-- roles
('create', (SELECT id FROM Models WHERE name = 'roles'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'roles'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'roles'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'roles'), NOW(), NOW()),
-- roles permissions
('create', (SELECT id FROM Models WHERE name = 'roles permissions'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'roles permissions'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'roles permissions'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'roles permissions'), NOW(), NOW()),
-- user
('create', (SELECT id FROM Models WHERE name = 'user'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'user'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'user'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'user'), NOW(), NOW()),
-- user roles
('create', (SELECT id FROM Models WHERE name = 'user roles'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'user roles'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'user roles'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'user roles'), NOW(), NOW()),
-- brand
('create', (SELECT id FROM Models WHERE name = 'brand'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'brand'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'brand'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'brand'), NOW(), NOW()),
-- unit
('create', (SELECT id FROM Models WHERE name = 'unit'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'unit'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'unit'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'unit'), NOW(), NOW()),
-- variant
('create', (SELECT id FROM Models WHERE name = 'variant'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'variant'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'variant'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'variant'), NOW(), NOW()),
-- variant attribute
('create', (SELECT id FROM Models WHERE name = 'variant attribute'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'variant attribute'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'variant attribute'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'variant attribute'), NOW(), NOW()),
-- warehouse
('create', (SELECT id FROM Models WHERE name = 'warehouse'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'warehouse'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'warehouse'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'warehouse'), NOW(), NOW()),
-- warranty
('create', (SELECT id FROM Models WHERE name = 'warranty'), NOW(), NOW()),
('read', (SELECT id FROM Models WHERE name = 'warranty'), NOW(), NOW()),
('update', (SELECT id FROM Models WHERE name = 'warranty'), NOW(), NOW()),
('delete', (SELECT id FROM Models WHERE name = 'warranty'), NOW(), NOW());
