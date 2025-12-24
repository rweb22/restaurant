const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize, User } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Category Add-Ons API', () => {
  let adminToken;
  let clientToken;
  let categoryId;
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

    // Create a category for testing
    const categoryResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Category for Add-Ons',
        description: 'Test category'
      });

    categoryId = categoryResponse.body.category.id;

    // Create an add-on for testing
    const addOnResponse = await request(app)
      .post('/api/add-ons')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Category Add-On',
        price: 15.00,
        isAvailable: true
      });

    addOnId = addOnResponse.body.addOn.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/category-add-ons', () => {
    it('should link add-on to category as admin', async () => {
      const response = await request(app)
        .post('/api/category-add-ons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: categoryId,
          addOnId: addOnId
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.categoryAddOn).toBeDefined();
    });

    it('should reject linking as client', async () => {
      await request(app)
        .post('/api/category-add-ons')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          categoryId: categoryId,
          addOnId: addOnId
        })
        .expect(403);
    });

    it('should reject linking without auth', async () => {
      await request(app)
        .post('/api/category-add-ons')
        .send({
          categoryId: categoryId,
          addOnId: addOnId
        })
        .expect(401);
    });

    it('should reject duplicate linking', async () => {
      await request(app)
        .post('/api/category-add-ons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: categoryId,
          addOnId: addOnId
        })
        .expect(400);
    });
  });

  describe('GET /api/category-add-ons', () => {
    it('should return category add-ons (public)', async () => {
      const response = await request(app)
        .get(`/api/category-add-ons?categoryId=${categoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.categoryAddOns)).toBe(true);
      expect(response.body.categoryAddOns.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/category-add-ons/:id', () => {
    it('should reject unlinking as client', async () => {
      // Get the category add-on ID
      const getResponse = await request(app)
        .get(`/api/category-add-ons?categoryId=${categoryId}`)
        .expect(200);

      const categoryAddOnId = getResponse.body.categoryAddOns[0].id;

      await request(app)
        .delete(`/api/category-add-ons/${categoryAddOnId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should unlink add-on from category as admin', async () => {
      // Get the category add-on ID
      const getResponse = await request(app)
        .get(`/api/category-add-ons?categoryId=${categoryId}`)
        .expect(200);

      const categoryAddOnId = getResponse.body.categoryAddOns[0].id;

      const response = await request(app)
        .delete(`/api/category-add-ons/${categoryAddOnId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return empty list after unlinking', async () => {
      const response = await request(app)
        .get(`/api/category-add-ons?categoryId=${categoryId}`)
        .expect(200);

      expect(response.body.categoryAddOns.length).toBe(0);
    });
  });
});

