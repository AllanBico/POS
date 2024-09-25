// __tests__/brand.test.js
const request = require('supertest');
const express = require('express');
const router = require('../routes/product/brand');
const { Brand } = require('../models/associations');
const authenticateToken = require('../middleware/auth');

jest.mock('../models/associations', () => ({
    Brand: {
        create: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn(),
    },
}));

jest.mock('../middleware/auth', () => jest.fn((req, res, next) => next()));

describe('Brand routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            req.io = { emit: jest.fn() };
            next();
        });
        app.use('/brands', router);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Create a new brand
    describe('POST /brands', () => {
        it('should create a new brand and emit an event', async () => {
            const newBrand = { id: 1, name: 'BrandA', description: 'Brand A Description' };
            Brand.create.mockResolvedValue(newBrand);

            const res = await request(app)
                .post('/brands')
                .send({ name: 'BrandA', description: 'Brand A Description' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(newBrand);
            expect(Brand.create).toHaveBeenCalledWith({ name: 'BrandA', description: 'Brand A Description' });
            expect(res.req.io.emit).toHaveBeenCalledWith('newBrand', newBrand);
        });

        it('should return 400 if name or description is missing', async () => {
            const res = await request(app)
                .post('/brands')
                .send({ name: 'BrandA' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Name and description are required');
        });
    });

    // Get all brands
    describe('GET /brands', () => {
        it('should get all brands', async () => {
            const brands = [{ id: 1, name: 'BrandA', description: 'Brand A' }];
            Brand.findAll.mockResolvedValue(brands);

            const res = await request(app).get('/brands');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(brands);
            expect(Brand.findAll).toHaveBeenCalled();
        });
    });

    // Get brand by ID
    describe('GET /brands/:id', () => {
        it('should return a brand by ID', async () => {
            const brand = { id: 1, name: 'BrandA', description: 'Brand A' };
            Brand.findByPk.mockResolvedValue(brand);

            const res = await request(app).get('/brands/1');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(brand);
            expect(Brand.findByPk).toHaveBeenCalledWith(1);
        });

        it('should return 404 if brand is not found', async () => {
            Brand.findByPk.mockResolvedValue(null);

            const res = await request(app).get('/brands/1');

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Brand not found');
        });

        it('should return 400 for invalid ID', async () => {
            const res = await request(app).get('/brands/abc');

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Invalid Brand ID');
        });
    });

    // Update a brand
    describe('PUT /brands/:id', () => {
        it('should update a brand and emit an event', async () => {
            const brand = { id: 1, name: 'BrandA', description: 'Brand A' };
            Brand.findByPk.mockResolvedValue(brand);

            const updatedBrand = { id: 1, name: 'BrandB', description: 'Updated Description' };
            Brand.findByPk.mockResolvedValueOnce(updatedBrand);

            const res = await request(app)
                .put('/brands/1')
                .send({ name: 'BrandB', description: 'Updated Description' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(updatedBrand);
            expect(Brand.findByPk).toHaveBeenCalledWith(1);
            expect(res.req.io.emit).toHaveBeenCalledWith('updateBrand', updatedBrand);
        });

        it('should return 400 if name or description is missing', async () => {
            const res = await request(app)
                .put('/brands/1')
                .send({ name: 'BrandA' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Name and description are required');
        });

        it('should return 404 if brand is not found', async () => {
            Brand.findByPk.mockResolvedValue(null);

            const res = await request(app).put('/brands/1').send({ name: 'BrandA', description: 'Updated' });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Brand not found');
        });

        it('should return 400 for invalid ID', async () => {
            const res = await request(app).put('/brands/abc').send({ name: 'BrandA', description: 'Updated' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Invalid ID');
        });
    });

    // Delete a brand
    describe('DELETE /brands/:id', () => {
        it('should delete a brand and emit an event', async () => {
            const brand = { id: 1, name: 'BrandA', description: 'Brand A' };
            Brand.findByPk.mockResolvedValue(brand);

            const res = await request(app).delete('/brands/1');

            expect(res.statusCode).toBe(204);
            expect(Brand.destroy).toHaveBeenCalled();
            expect(res.req.io.emit).toHaveBeenCalledWith('deleteBrand', 1);
        });

        it('should return 404 if brand is not found', async () => {
            Brand.findByPk.mockResolvedValue(null);

            const res = await request(app).delete('/brands/1');

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Brand not found');
        });

        it('should return 400 for invalid ID', async () => {
            const res = await request(app).delete('/brands/abc');

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Invalid ID');
        });
    });
});
