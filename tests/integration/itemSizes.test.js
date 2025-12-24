const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize, User } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Item Sizes API (Standalone Routes)', () => {
  let adminToken;
  let clientToken;
  let itemId;
  let itemSizeId;

  beforeAll(async () => {
    await sequelize.authenticate();

    // Get admin token
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

    // Get client token
    const clientOtp = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '+919876543210' });

    const clientAuth = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        phone: '+919876543210',
        otp: '123456',
        secret: clientOtp.body.secret
      });

    clientToken = clientAuth.body.accessToken;

    // Create an item for testing
    const itemResponse = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: 'Test Item for Sizes',
        description: 'Test item',
        isAvailable: true
      });

    itemId = itemResponse.body.item.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/item-sizes', () => {
    it('should return all item sizes (public)', async () => {
      const response = await request(app)
        .get('/api/item-sizes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.itemSizes)).toBe(true);
    });
  });

  describe('POST /api/item-sizes', () => {
    it('should create item size as admin', async () => {
      const response = await request(app)
        .post('/api/item-sizes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          itemId: itemId,
          size: 'large',
          price: 499.00,
          isAvailable: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.itemSize.size).toBe('large');
      expect(parseFloat(response.body.itemSize.price)).toBe(499.00);

      itemSizeId = response.body.itemSize.id;
    });

    it('should reject creation as client', async () => {
      await request(app)
        .post('/api/item-sizes')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          itemId: itemId,
          size: 'hacked-size',
          price: 1.00
        })
        .expect(403);
    });

    it('should reject creation without auth', async () => {
      await request(app)
        .post('/api/item-sizes')
        .send({
          itemId: itemId,
          size: 'no-auth-size',
          price: 1.00
        })
        .expect(401);
    });
  });

  describe('GET /api/item-sizes/:id', () => {
    it('should return item size by ID (public)', async () => {
      const response = await request(app)
        .get(`/api/item-sizes/${itemSizeId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.itemSize.id).toBe(itemSizeId);
      expect(response.body.itemSize.size).toBe('large');
    });

    it('should return 404 for non-existent item size', async () => {
      await request(app)
        .get('/api/item-sizes/99999')
        .expect(404);
    });
  });

  describe('PUT /api/item-sizes/:id', () => {
    it('should update item size as admin', async () => {
      const response = await request(app)
        .put(`/api/item-sizes/${itemSizeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          size: 'medium',
          price: 549.00
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.itemSize.size).toBe('medium');
      expect(parseFloat(response.body.itemSize.price)).toBe(549.00);
    });

    it('should reject update as client', async () => {
      await request(app)
        .put(`/api/item-sizes/${itemSizeId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          size: 'hacked-update'
        })
        .expect(403);
    });
  });

  describe('DELETE /api/item-sizes/:id', () => {
    it('should reject delete as client', async () => {
      await request(app)
        .delete(`/api/item-sizes/${itemSizeId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should delete item size as admin', async () => {
      const response = await request(app)
        .delete(`/api/item-sizes/${itemSizeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for already deleted item size', async () => {
      await request(app)
        .get(`/api/item-sizes/${itemSizeId}`)
        .expect(404);
    });
  });
});

