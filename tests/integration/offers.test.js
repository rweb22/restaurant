const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize, User } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Offers API', () => {
  let adminToken;
  let clientToken;
  let addressId;
  let itemSizeId;
  let offerId;

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
      .send({ phone: '+919111111111' });

    const clientAuth = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        phone: '+919111111111',
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

    // Create an item for testing offers with orders
    const itemResponse = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId: 1,
        name: 'Test Pizza for Offers',
        description: 'Test pizza for offers',
        isAvailable: true
      });

    const itemId = itemResponse.body.item.id;

    // Create a size for the item
    const sizeResponse = await request(app)
      .post(`/api/items/${itemId}/sizes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        size: 'large',
        price: 399.00,
        isAvailable: true
      });

    itemSizeId = sizeResponse.body.itemSize.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/offers', () => {
    it('should return all active offers (public)', async () => {
      const response = await request(app)
        .get('/api/offers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.offers)).toBe(true);
    });
  });

  describe('POST /api/offers', () => {
    it('should create offer as admin', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // Use unique code with timestamp to avoid conflicts
      const uniqueCode = `TEST${Date.now()}`;

      const response = await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: uniqueCode,
          title: 'Test 50% Off',
          description: 'Test 50% off',
          discountType: 'percentage',
          discountValue: 50,
          minOrderValue: 100,
          validFrom: tomorrow.toISOString(),
          validTo: nextMonth.toISOString(),
          isActive: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.offer.code).toBe(uniqueCode);
    });

    it('should reject offer creation as client', async () => {
      await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          code: 'HACK50',
          description: 'Hacked offer',
          discountType: 'percentage',
          discountValue: 100
        })
        .expect(403);
    });
  });

  describe('Order with Offer', () => {
    it('should apply valid offer to order', async () => {
      // First create an offer with unique code
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const uniqueOfferCode = `FLAT${Date.now()}`;

      await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: uniqueOfferCode,
          title: 'Flat 100 Off',
          description: 'Flat 100 rupees off',
          discountType: 'flat',
          discountValue: 100,
          minOrderValue: 500,
          validFrom: yesterday.toISOString(),
          validTo: nextMonth.toISOString(),
          isActive: true
        });

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          addressId,
          offerCode: uniqueOfferCode,
          items: [
            {
              itemSizeId,
              quantity: 10,
              addOns: []
            }
          ],
          deliveryCharge: 50
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.order.discountAmount).toBeGreaterThan(0);
      expect(response.body.order.offer).toBeDefined();
    });

    it('should reject invalid offer code', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          addressId,
          offerCode: 'INVALID',
          items: [
            {
              itemSizeId,
              quantity: 1
            }
          ]
        })
        .expect(400);
    });

    it('should reject expired offer', async () => {
      // Create an expired offer
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const expiredCode = `EXPIRED${Date.now()}`;

      await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: expiredCode,
          title: 'Expired Offer',
          description: 'This offer has expired',
          discountType: 'flat',
          discountValue: 50,
          validFrom: lastMonth.toISOString(),
          validTo: yesterday.toISOString(),
          isActive: true
        });

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          addressId,
          offerCode: expiredCode,
          items: [
            {
              itemSizeId,
              quantity: 10,
              addOns: []
            }
          ],
          deliveryCharge: 50
        })
        .expect(400);
    });

    it('should reject inactive offer', async () => {
      // Create an inactive offer
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const inactiveCode = `INACTIVE${Date.now()}`;

      await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: inactiveCode,
          title: 'Inactive Offer',
          description: 'This offer is inactive',
          discountType: 'flat',
          discountValue: 50,
          validFrom: tomorrow.toISOString(),
          validTo: nextMonth.toISOString(),
          isActive: false
        });

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          addressId,
          offerCode: inactiveCode,
          items: [
            {
              itemSizeId,
              quantity: 10,
              addOns: []
            }
          ],
          deliveryCharge: 50
        })
        .expect(400);
    });
  });

  describe('GET /api/offers/:id', () => {
    it('should return offer by ID (public)', async () => {
      // Create an offer first
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const offerResponse = await request(app)
        .post('/api/offers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: `GETTEST${Date.now()}`,
          title: 'Get Test Offer',
          description: 'Test offer for GET endpoint',
          discountType: 'percentage',
          discountValue: 25,
          validFrom: tomorrow.toISOString(),
          validTo: nextMonth.toISOString(),
          isActive: true
        });

      offerId = offerResponse.body.offer.id;

      const response = await request(app)
        .get(`/api/offers/${offerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.offer.id).toBe(offerId);
      expect(response.body.offer.discountType).toBe('percentage');
    });

    it('should return 404 for non-existent offer', async () => {
      await request(app)
        .get('/api/offers/99999')
        .expect(404);
    });
  });

  describe('PUT /api/offers/:id', () => {
    it('should update offer as admin', async () => {
      const response = await request(app)
        .put(`/api/offers/${offerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Offer Title',
          discountValue: 30
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.offer.title).toBe('Updated Offer Title');
      expect(parseFloat(response.body.offer.discountValue)).toBe(30);
    });

    it('should reject update as client', async () => {
      await request(app)
        .put(`/api/offers/${offerId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Hacked Title'
        })
        .expect(403);
    });
  });

  describe('DELETE /api/offers/:id', () => {
    it('should reject delete as client', async () => {
      await request(app)
        .delete(`/api/offers/${offerId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should delete offer as admin', async () => {
      const response = await request(app)
        .delete(`/api/offers/${offerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for deleted offer', async () => {
      await request(app)
        .get(`/api/offers/${offerId}`)
        .expect(404);
    });
  });
});

