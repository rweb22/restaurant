const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize, User } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Item Add-Ons API', () => {
  let adminToken;
  let clientToken;
  let itemId;
  let addOnId;

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
        name: 'Test Item for Add-Ons',
        description: 'Test item',
        isAvailable: true
      });

    itemId = itemResponse.body.item.id;

    // Create an add-on for testing
    const addOnResponse = await request(app)
      .post('/api/add-ons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Item Add-On',
        price: 20.00,
        isAvailable: true
      });

    addOnId = addOnResponse.body.addOn.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/item-add-ons', () => {
    it('should link add-on to item as admin', async () => {
      const response = await request(app)
        .post('/api/item-add-ons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          itemId: itemId,
          addOnId: addOnId
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.itemAddOn).toBeDefined();
    });

    it('should reject linking as client', async () => {
      await request(app)
        .post('/api/item-add-ons')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          itemId: itemId,
          addOnId: addOnId
        })
        .expect(403);
    });

    it('should reject linking without auth', async () => {
      await request(app)
        .post('/api/item-add-ons')
        .send({
          itemId: itemId,
          addOnId: addOnId
        })
        .expect(401);
    });

    it('should reject duplicate linking', async () => {
      await request(app)
        .post('/api/item-add-ons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          itemId: itemId,
          addOnId: addOnId
        })
        .expect(400);
    });
  });

  describe('GET /api/item-add-ons', () => {
    it('should return item add-ons (public)', async () => {
      const response = await request(app)
        .get(`/api/item-add-ons?itemId=${itemId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.itemAddOns)).toBe(true);
      expect(response.body.itemAddOns.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/item-add-ons/:id', () => {
    it('should reject unlinking as client', async () => {
      // Get the item add-on ID
      const getResponse = await request(app)
        .get(`/api/item-add-ons?itemId=${itemId}`)
        .expect(200);

      const itemAddOnId = getResponse.body.itemAddOns[0].id;

      await request(app)
        .delete(`/api/item-add-ons/${itemAddOnId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should unlink add-on from item as admin', async () => {
      // Get the item add-on ID
      const getResponse = await request(app)
        .get(`/api/item-add-ons?itemId=${itemId}`)
        .expect(200);

      const itemAddOnId = getResponse.body.itemAddOns[0].id;

      const response = await request(app)
        .delete(`/api/item-add-ons/${itemAddOnId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return empty list after unlinking', async () => {
      const response = await request(app)
        .get(`/api/item-add-ons?itemId=${itemId}`)
        .expect(200);

      expect(response.body.itemAddOns.length).toBe(0);
    });
  });
});

