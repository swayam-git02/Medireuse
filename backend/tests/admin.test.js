import request from 'supertest';
import connectDB, { closeDB } from '../src/config/db.js';
import { createUser } from '../src/data/store.js';
import app from '../server.js';

let adminToken;
let userToken;

beforeAll(async () => {
  connectDB(':memory:');

  await createUser({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  });

  await createUser({
    name: 'Normal User',
    email: 'user@example.com',
    password: 'password123',
  });

  const resA = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'password123' })
    .expect(200);
  adminToken = resA.body.token;

  const resU = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@example.com', password: 'password123' })
    .expect(200);
  userToken = resU.body.token;
});

afterAll(() => {
  closeDB();
});

describe('Admin routes', () => {
  test('non-authenticated cannot access admin endpoint', async () => {
    await request(app).get('/api/admin/users').expect(401);
  });

  test('authenticated non-admin gets 403', async () => {
    await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  test('admin user can fetch list of users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
    expect(res.body.users[0].password).toBeUndefined();
  });
});
