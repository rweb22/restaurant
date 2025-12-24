const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize, User } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Add-Ons API', () => {
  let adminToken;
  let clientToken;
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
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/add-ons', () => {
    it('should return all add-ons (public)', async () => {
      const response = await request(app)
        .get('/api/add-ons')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.addOns)).toBe(true);
    });
  });

  describe('POST /api/add-ons', () => {
    it('should create add-on as admin', async () => {
      const response = await request(app)
        .post('/api/add-ons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Add-On',
          price: 25.00,
          isAvailable: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.addOn.name).toBe('Test Add-On');
      expect(parseFloat(response.body.addOn.price)).toBe(25.00);
      
      addOnId = response.body.addOn.id;
    });

    it('should reject creation as client', async () => {
      await request(app)
        .post('/api/add-ons')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: 'Hacked Add-On',
          price: 10.00
        })
        .expect(403);
    });

    it('should reject creation without auth', async () => {
      await request(app)
        .post('/api/add-ons')
        .send({
          name: 'No Auth Add-On',
          price: 10.00
        })
        .expect(401);
    });
  });

  describe('GET /api/add-ons/:id', () => {
    it('should return add-on by ID (public)', async () => {
      const response = await request(app)
        .get(`/api/add-ons/${addOnId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.addOn.id).toBe(addOnId);
      expect(response.body.addOn.name).toBe('Test Add-On');
    });

    it('should return 404 for non-existent add-on', async () => {
      await request(app)
        .get('/api/add-ons/99999')
        .expect(404);
    });
  });

  describe('PUT /api/add-ons/:id', () => {
    it('should update add-on as admin', async () => {
      const response = await request(app)
        .put(`/api/add-ons/${addOnId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Add-On',
          price: 30.00
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.addOn.name).toBe('Updated Add-On');
      expect(parseFloat(response.body.addOn.price)).toBe(30.00);
    });

    it('should reject update as client', async () => {
      await request(app)
        .put(`/api/add-ons/${addOnId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: 'Hacked Update'
        })
        .expect(403);
    });
  });

  describe('DELETE /api/add-ons/:id', () => {
    it('should reject delete as client', async () => {
      await request(app)
        .delete(`/api/add-ons/${addOnId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should delete add-on as admin', async () => {
      const response = await request(app)
        .delete(`/api/add-ons/${addOnId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for already deleted add-on', async () => {
      await request(app)
        .get(`/api/add-ons/${addOnId}`)
        .expect(404);
    });
  });
});

