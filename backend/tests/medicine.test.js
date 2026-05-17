import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import connectDB from '../src/config/db.js';
import app from '../server.js';

let mongoServer;
let token;
let secondUserToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDB(uri);

  const registerRes = await request(app).post('/api/auth/register').send({
    name: 'Medicine Seller',
    email: 'medicine-seller@example.com',
    password: 'password123'
  });

  token = registerRes.body.token;

  const secondRegisterRes = await request(app).post('/api/auth/register').send({
    name: 'Another Seller',
    email: 'another-seller@example.com',
    password: 'password123'
  });

  secondUserToken = secondRegisterRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Medicine listing with MRP', () => {
  test('creates listing with only MRP and uses MRP as selling price', async () => {
    const res = await request(app)
      .post('/api/medicines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicineName: 'Paracetamol 650',
        medicineSalt: 'Acetaminophen',
        shortDescription: 'Used for fever and mild pain',
        expiryDate: '2027-12-31',
        medicineType: 'Tablet',
        quantity: 3,
        mrp: 150,
        imageUrl: 'https://example.com/paracetamol.jpg'
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.medicine).toBeDefined();
    expect(res.body.medicine.pricePerUnit).toBe(150);
    expect(res.body.medicine.mrp).toBe(150);
  });

  test('rejects listing when selling price is greater than MRP', async () => {
    const res = await request(app)
      .post('/api/medicines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicineName: 'Ibuprofen',
        medicineSalt: 'Ibuprofen',
        shortDescription: 'Pain relief tablet',
        expiryDate: '2027-10-10',
        medicineType: 'Tablet',
        quantity: 1,
        pricePerUnit: 200,
        mrp: 150,
        imageUrl: 'https://example.com/ibuprofen.jpg'
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Selling price cannot be greater than MRP');
  });

  test('deletes own medicine listing successfully', async () => {
    const createRes = await request(app)
      .post('/api/medicines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicineName: 'Cetrizine',
        medicineSalt: 'Cetirizine Hydrochloride',
        shortDescription: 'Allergy relief tablet',
        expiryDate: '2027-08-30',
        medicineType: 'Tablet',
        quantity: 2,
        mrp: 90,
        imageUrl: 'https://example.com/cetrizine.jpg'
      })
      .expect(201);

    const medicineId = createRes.body.medicine._id;

    const deleteRes = await request(app)
      .delete(`/api/medicines/${medicineId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.message).toBe('Medicine listing deleted successfully');

    const myListRes = await request(app)
      .get('/api/medicines/mine')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const mine = Array.isArray(myListRes.body.medicines) ? myListRes.body.medicines : [];
    expect(mine.some((medicine) => medicine._id === medicineId)).toBe(false);

    const browseRes = await request(app)
      .get('/api/medicines')
      .expect(200);
    const browse = Array.isArray(browseRes.body.medicines) ? browseRes.body.medicines : [];
    expect(browse.some((medicine) => medicine._id === medicineId)).toBe(false);
  });

  test('does not allow deleting another user listing', async () => {
    const createRes = await request(app)
      .post('/api/medicines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        medicineName: 'Azithromycin',
        medicineSalt: 'Azithromycin',
        shortDescription: 'Antibiotic tablet',
        expiryDate: '2027-06-30',
        medicineType: 'Tablet',
        quantity: 1,
        mrp: 220,
        imageUrl: 'https://example.com/azithromycin.jpg'
      })
      .expect(201);

    const medicineId = createRes.body.medicine._id;

    const deleteRes = await request(app)
      .delete(`/api/medicines/${medicineId}`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .expect(403);

    expect(deleteRes.body.success).toBe(false);
    expect(deleteRes.body.message).toBe('Not authorized to delete this medicine listing');
  });

  test('returns 400 for invalid medicine id while deleting', async () => {
    const deleteRes = await request(app)
      .delete('/api/medicines/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(deleteRes.body.success).toBe(false);
    expect(deleteRes.body.message).toBe('Invalid medicine listing id');
  });
});
