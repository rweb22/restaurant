const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize, User } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Items API', () => {
  let adminToken;

  beforeAll(async () => {
    await sequelize.authenticate();

    const adminOtp = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '+919999999999' });

    const adminAuth = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        phone: '+919999999999',
        otp: '123456',
        secret: adminOtp.body.secret
      });

    adminToken = adminAuth.body.accessToken;

    // Update user to admin role
    await User.update(
      { role: 'admin' },
      { where: { phone: '+919999999999' } }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/items', () => {
    it('should return all items (public)', async () => {
      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should filter items by category', async () => {
      const response = await request(app)
        .get('/api/items?categoryId=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return item by ID with sizes and add-ons', async () => {
      const response = await request(app)
        .get('/api/items/1?includeSizes=true&includeAddOns=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.item).toBeDefined();
      expect(response.body.item.id).toBe(1);
    });
  });

  describe('POST /api/items', () => {
    it('should create item as admin', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: 1,
          name: 'Test Item',
          description: 'Test description',
          imageUrl: 'https://example.com/image.jpg',
          isAvailable: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.item.name).toBe('Test Item');
    });
  });

  describe('Nested Size Routes', () => {
    let testItemId;
    let testSizeId;

    beforeEach(async () => {
      // Create a test item
      const itemResponse = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: 1,
          name: 'Size Test Item',
          description: 'Item for testing sizes',
          isAvailable: true
        });

      testItemId = itemResponse.body.item.id;

      // Create a test size for the item
      const sizeResponse = await request(app)
        .post(`/api/items/${testItemId}/sizes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          size: 'small',
          price: 10.00,
          isAvailable: true
        });

      testSizeId = sizeResponse.body.itemSize.id;
    });

    describe('POST /api/items/:id/sizes', () => {
      it('should add size to item as admin', async () => {
        const response = await request(app)
          .post(`/api/items/${testItemId}/sizes`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            size: 'medium',
            price: 14.99,
            isAvailable: true
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.itemSize.size).toBe('medium');
        expect(response.body.itemSize.itemId).toBe(testItemId);
      });

      it('should reject adding size to non-existent item', async () => {
        await request(app)
          .post('/api/items/99999/sizes')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            size: 'small',
            price: 9.99
          })
          .expect(404);
      });
    });

    describe('PUT /api/items/:id/sizes/:sizeId', () => {
      it('should update item size as admin', async () => {
        const response = await request(app)
          .put(`/api/items/${testItemId}/sizes/${testSizeId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            price: 9.99
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(parseFloat(response.body.itemSize.price)).toBe(9.99);
      });

      it('should reject updating size that does not belong to item', async () => {
        // Create another item
        const otherItemResponse = await request(app)
          .post('/api/items')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            categoryId: 1,
            name: 'Other Item',
            description: 'Another item',
            isAvailable: true
          });

        const otherItemId = otherItemResponse.body.item.id;

        // Try to update testSizeId (which belongs to testItemId) via otherItemId
        await request(app)
          .put(`/api/items/${otherItemId}/sizes/${testSizeId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            price: 20.00
          })
          .expect(400);
      });
    });

    describe('DELETE /api/items/:id/sizes/:sizeId', () => {
      it('should reject deleting size that does not belong to item', async () => {
        // Create another item
        const otherItemResponse = await request(app)
          .post('/api/items')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            categoryId: 1,
            name: 'Other Item',
            description: 'Another item',
            isAvailable: true
          });

        const otherItemId = otherItemResponse.body.item.id;

        // Try to delete testSizeId (which belongs to testItemId) via otherItemId
        await request(app)
          .delete(`/api/items/${otherItemId}/sizes/${testSizeId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });
    });
  });
});

