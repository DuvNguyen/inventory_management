/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from '../src/common/interceptors/response-transform.interceptor';

describe('Inventory Portal (e2e)', () => {
  let app: INestApplication;
  let mongooseConnection: Connection;
  let adminToken: string;
  let staffToken: string;
  let testProductId: string;

  beforeAll(async () => {
    // Set a test database URI if not already defined
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/inventory-test';
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseTransformInterceptor());

    await app.init();

    mongooseConnection = moduleFixture.get<Connection>(getConnectionToken());
    // Clear test database collections
    await mongooseConnection.dropDatabase();

    // Directly seed ADMIN user into the DB since registration cannot create ADMINs
    const hashedPassword = await bcrypt.hash('Password123', 12);
    await mongooseConnection.collection('users').insertOne({
      email: 'admin@inventory.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    if (mongooseConnection) {
      await mongooseConnection.close();
    }
    await app.close();
  });

  describe('Authentication Module', () => {
    it('should register a STAFF user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'staff@inventory.com',
          password: 'Password123',
          firstName: 'Staff',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should fail registration for duplicate email with 409', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'staff@inventory.com',
          password: 'Password123',
          firstName: 'Another',
          lastName: 'Staff',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });

    it('should log in successfully as ADMIN and get a JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@inventory.com',
          password: 'Password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      adminToken = response.body.data.accessToken;
    });

    it('should log in successfully as STAFF and get a JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'staff@inventory.com',
          password: 'Password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      staffToken = response.body.data.accessToken;
    });

    it('should reject login with wrong credentials with 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@inventory.com',
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('Products Module', () => {
    it('should block product creation without authentication (401)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          sku: 'PROD-A',
          name: 'Product A',
          price: 99.99,
          stock: 10,
        })
        .expect(401);
    });

    it('should block product creation by STAFF role (403)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          sku: 'PROD-A',
          name: 'Product A',
          price: 99.99,
          stock: 10,
        })
        .expect(403);
    });

    it('should create a product successfully by ADMIN (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'PROD-A',
          name: 'Product A',
          price: 99.99,
          stock: 10,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sku).toBe('PROD-A');
      expect(response.body.data.name).toBe('Product A');
      testProductId = response.body.data._id;
    });

    it('should allow STAFF to fetch the products list (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeInstanceOf(Array);
      expect(response.body.data.data.length).toBe(1);
    });

    it('should block STAFF from updating a product (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          price: 89.99,
        })
        .expect(403);
    });

    it('should allow ADMIN to update a product (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 119.99,
          stock: 15,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(119.99);
      expect(response.body.data.stock).toBe(15);
    });

    it('should support search query and pagination (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products?search=Product&page=1&limit=10')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.total).toBe(1);
    });
  });
});
