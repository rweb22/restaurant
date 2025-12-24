const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize, User } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Orders API', () => {
  let adminToken;
  let clientToken;
  let addressId;
  let itemSizeId;
  let addOnId;
  let orderId;

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

    // Create address for client
    const addressResponse = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        label: 'Home',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'India',
        isDefault: true
      });

    addressId = addressResponse.body.address.id;

    // Create an item for testing orders
    const itemResponse = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: 'Test Pizza',
        description: 'Test pizza for orders',
        isAvailable: true
      });

    const itemId = itemResponse.body.item.id;

    // Create a size for the item
    const sizeResponse = await request(app)
      .post(`/api/items/${itemId}/sizes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        size: 'medium',
        price: 299.00,
        isAvailable: true
      });

    itemSizeId = sizeResponse.body.itemSize.id;

    // Get an add-on ID from seeded data (add-on ID 1 should exist from seeder)
    addOnId = 1;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/orders', () => {
    it('should create order with items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          addressId,
          items: [
            {
              itemSizeId,
              quantity: 2,
              addOns: []
            }
          ],
          deliveryCharge: 50
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.order).toBeDefined();
      expect(response.body.order.status).toBe('pending');
      expect(response.body.order.items).toBeDefined();
      expect(response.body.order.items.length).toBe(1);

      orderId = response.body.order.id;
    });

    it('should create order with add-ons', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          addressId,
          items: [
            {
              itemSizeId,
              quantity: 1,
              addOns: [
                { addOnId, quantity: 1 }
              ]
            }
          ],
          deliveryCharge: 50
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.order.items[0].addOns).toBeDefined();
      expect(response.body.order.items[0].addOns.length).toBeGreaterThan(0);
    });

    it('should reject order without address', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          items: [
            {
              itemSizeId: 1,
              quantity: 1
            }
          ]
        })
        .expect(400);
    });

    it('should reject order without items', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          addressId,
          items: []
        })
        .expect(400);
    });
  });

  describe('GET /api/orders', () => {
    it('should return user orders as client', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.orders)).toBe(true);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order by ID for owner', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.id).toBe(orderId);
      expect(response.body.order.items).toBeDefined();
    });

    it('should return 404 for non-existent order', async () => {
      await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status as admin', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'confirmed'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.status).toBe('confirmed');
    });

    it('should reject invalid status transition', async () => {
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'completed'
        })
        .expect(400);
    });
  });

  describe('POST /api/orders/:id/cancel', () => {
    it('should cancel order as owner', async () => {
      const response = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.status).toBe('cancelled');
    });

    it('should reject cancelling already cancelled order', async () => {
      await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);
    });
  });
});

