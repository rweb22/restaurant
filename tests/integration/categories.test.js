const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize, User } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Categories API', () => {
  let adminToken;
  let clientToken;

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

  describe('GET /api/categories', () => {
    it('should return all categories (public)', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.categories)).toBe(true);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return category by ID (public)', async () => {
      const response = await request(app)
        .get('/api/categories/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.category).toBeDefined();
      expect(response.body.category.id).toBe(1);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get('/api/categories/99999')
        .expect(404);
    });
  });

  describe('POST /api/categories', () => {
    it('should create category as admin', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Category',
          description: 'Test description',
          isAvailable: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.category.name).toBe('Test Category');
    });

    it('should reject creation as client', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: 'Test Category 2',
          description: 'Test description'
        })
        .expect(403);
    });

    it('should reject creation without auth', async () => {
      await request(app)
        .post('/api/categories')
        .send({
          name: 'Test Category 3',
          description: 'Test description'
        })
        .expect(401);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update category as admin', async () => {
      const response = await request(app)
        .put('/api/categories/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated description'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.category.description).toBe('Updated description');
    });

    it('should reject update as client', async () => {
      await request(app)
        .put('/api/categories/1')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          description: 'Hacked description'
        })
        .expect(403);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should reject delete as client', async () => {
      await request(app)
        .delete('/api/categories/1')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });
});

