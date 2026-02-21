import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import connectDB from '../src/config/db.js';
import app from '../server.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Auth flows: register, login, refresh, logout', () => {
  const user = { name: 'Test User', email: 'test@example.com', password: 'password123' };
  let cookie;

  test('Register should return token and set refresh cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(user).expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    // capture cookie for subsequent requests
    cookie = setCookie.join(';');
  });

  test('Login should set refresh cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password }).expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    cookie = setCookie.join(';');
  });

  test('Refresh should rotate and return new access token', async () => {
    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie).expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    cookie = setCookie.join(';');
  });

  test('Logout should revoke refresh token and clear cookie', async () => {
    const res = await request(app).post('/api/auth/logout').set('Cookie', cookie).expect(200);
    expect(res.body.success).toBe(true);
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    // cookie should be cleared
    expect(setCookie.join(';').toLowerCase()).toMatch(/refreshtoken=;/);
  });
});
