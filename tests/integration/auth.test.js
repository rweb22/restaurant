const path = require('path');
const request = require(path.resolve(__dirname, '../../app/node_modules/supertest'));
const app = require(path.resolve(__dirname, '../../app/src/index'));
const { sequelize } = require(path.resolve(__dirname, '../../app/src/models'));

describe('Authentication API', () => {
  beforeAll(async () => {
    // Ensure database is connected
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/send-otp', () => {
    it('should send OTP to valid phone number', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '+919876543210' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.secret).toBeDefined();
      expect(response.body.message).toContain('OTP sent');
    });

    it('should reject invalid phone number', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    let secret;

    beforeEach(async () => {
      const otpResponse = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '+919876543210' });
      secret = otpResponse.body.secret;
    });

    it('should verify OTP and return tokens', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '123456',
          secret
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.phone).toBe('+919876543210');
    });

    it('should reject invalid OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '000000',
          secret
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const otpResponse = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '+919876543210' });
      
      const verifyResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '123456',
          secret: otpResponse.body.secret
        });
      
      token = verifyResponse.body.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.phone).toBe('+919876543210');
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      const otpResponse = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '+919876543210' });

      const authResponse = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '123456',
          secret: otpResponse.body.secret
        });

      token = authResponse.body.accessToken;
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Updated Name');
    });

    it('should reject profile update without auth', async () => {
      await request(app)
        .put('/api/auth/profile')
        .send({
          name: 'Hacked Name'
        })
        .expect(401);
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid Indian phone numbers', async () => {
      const validPhones = ['+919876543210', '+918888888888', '+917777777777'];

      for (const phone of validPhones) {
        const response = await request(app)
          .post('/api/auth/send-otp')
          .send({ phone })
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });

    it('should reject invalid phone formats', async () => {
      const invalidPhones = ['abcdefghij', '', '+0123456789'];

      for (const phone of invalidPhones) {
        await request(app)
          .post('/api/auth/send-otp')
          .send({ phone })
          .expect(400);
      }
    });
  });
});

