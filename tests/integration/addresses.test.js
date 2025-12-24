const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Addresses API', () => {
  let clientToken;

  beforeAll(async () => {
    await sequelize.authenticate();

    const clientOtp = await request(app)
      .post('/api/auth/send-otp')
      .send({ phone: '+919222222222' });
    
    const clientAuth = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        phone: '+919222222222',
        otp: '123456',
        secret: clientOtp.body.secret
      });
    
    clientToken = clientAuth.body.accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/addresses', () => {
    it('should create address for authenticated user', async () => {
      const response = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          label: 'Home',
          addressLine1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
          isDefault: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.address.label).toBe('Home');
      expect(response.body.address.isDefault).toBe(true);
    });

    it('should reject address creation without auth', async () => {
      await request(app)
        .post('/api/addresses')
        .send({
          label: 'Office',
          addressLine1: '456 Work St',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India'
        })
        .expect(401);
    });
  });

  describe('GET /api/addresses', () => {
    it('should return user addresses', async () => {
      const response = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.addresses)).toBe(true);
    });

    it('should reject request without auth', async () => {
      await request(app)
        .get('/api/addresses')
        .expect(401);
    });
  });

  describe('PUT /api/addresses/:id', () => {
    let addressId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          label: 'Test Address',
          addressLine1: '789 Test St',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        });

      addressId = response.body.address.id;
    });

    it('should update own address', async () => {
      const response = await request(app)
        .put(`/api/addresses/${addressId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          label: 'Updated Address'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.address.label).toBe('Updated Address');
    });
  });

  describe('DELETE /api/addresses/:id', () => {
    let addressId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          label: 'To Delete',
          addressLine1: '999 Delete St',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '600001',
          country: 'India'
        });

      addressId = response.body.address.id;
    });

    it('should delete own address', async () => {
      await request(app)
        .delete(`/api/addresses/${addressId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);
    });
  });
});

