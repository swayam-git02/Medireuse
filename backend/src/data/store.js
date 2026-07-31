import bcrypt from 'bcryptjs';
import validator from 'validator';
import { getDb } from '../config/db.js';
import { createEntityId, isValidEntityId } from '../utils/entityId.js';

export const USER_ROLES = Object.freeze(['user', 'admin']);
export const MEDICINE_TYPES = Object.freeze(['Tablet', 'Capsule', 'Syrup', 'Supplement', 'Other']);
export const ORDER_MEDICINE_TYPES = Object.freeze([...MEDICINE_TYPES, 'Verified']);
export const ORDER_STATUSES = Object.freeze(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);

const nowIso = () => new Date().toISOString();

const trimText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeNullableText = (value) => {
  const trimmedValue = trimText(value);
  return trimmedValue || null;
};

const normalizeEmail = (value) => trimText(value).toLowerCase();

const uniqueConstraintFailed = (error, columnName) => {
  const message = String(error?.message || '');
  return message.includes('UNIQUE constraint failed') && (!columnName || message.includes(columnName));
};

const mapUserRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone || '',
    address: row.address || '',
    createdAt: row.created_at,
  };
};

const mapUserRowWithPassword = (row) => {
  const user = mapUserRow(row);
  if (!user) {
    return null;
  }

  return {
    ...user,
    password: row.password,
    comparePassword: (enteredPassword) => bcrypt.compareSync(enteredPassword, row.password),
  };
};

const mapSeller = (row) => {
  if (!row?.seller_id) {
    return null;
  }

  return {
    _id: row.seller_id,
    id: row.seller_id,
    name: row.seller_name,
    email: row.seller_email,
  };
};

const mapMedicineRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    id: row.id,
    seller: mapSeller(row),
    medicineName: row.medicine_name,
    medicineSalt: row.medicine_salt,
    shortDescription: row.short_description,
    expiryDate: row.expiry_date,
    medicineType: row.medicine_type,
    quantity: Number(row.quantity),
    pricePerUnit: Number(row.price_per_unit),
    mrp: Number(row.mrp),
    imageUrl: row.image_url,
    imagePublicId: row.image_public_id || '',
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapBuyer = (row) => {
  if (!row?.buyer_id) {
    return null;
  }

  return {
    _id: row.buyer_id,
    id: row.buyer_id,
    name: row.buyer_name,
    email: row.buyer_email,
    phone: row.buyer_phone || '',
    address: row.buyer_address || '',
    createdAt: row.buyer_created_at,
    role: row.buyer_role,
  };
};

const mapOrderRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    id: row.id,
    buyer: mapBuyer(row),
    medicineName: row.medicine_name,
    medicineType: row.medicine_type,
    quantity: Number(row.quantity),
    pricePerUnit: Number(row.price_per_unit),
    mrp: Number(row.mrp),
    totalPrice: Number(row.total_price),
    expiryDate: row.expiry_date,
    status: row.status,
    paymentMethod: row.payment_method,
    shippingAddress: row.shipping_address,
    notes: row.notes || '',
    paymentId: row.payment_id || '',
    razorpayOrderId: row.razorpay_order_id || '',
    paymentSignature: row.payment_signature || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapTokenRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    _id: row.id,
    id: row.id,
    user: row.user_id
      ? {
          _id: row.user_id,
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          role: row.user_role,
          phone: row.user_phone || '',
          address: row.user_address || '',
          createdAt: row.user_created_at,
        }
      : null,
    token: row.token,
    expires: row.expires_at ? new Date(row.expires_at) : null,
    revoked: Boolean(row.revoked),
    createdAt: row.created_at,
  };
};

export const getUserById = (id) => {
  if (!isValidEntityId(id)) {
    return null;
  }

  const row = getDb()
    .prepare(`
      SELECT id, name, email, password, role, phone, address, created_at
      FROM users
      WHERE id = ?
    `)
    .get(id);

  return mapUserRow(row);
};

export const getUserWithPasswordByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !validator.isEmail(normalizedEmail)) {
    return null;
  }

  const row = getDb()
    .prepare(`
      SELECT id, name, email, password, role, phone, address, created_at
      FROM users
      WHERE email = ?
    `)
    .get(normalizedEmail);

  return mapUserRowWithPassword(row);
};

export const findUserByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !validator.isEmail(normalizedEmail)) {
    return null;
  }

  const row = getDb()
    .prepare(`
      SELECT id, name, email, password, role, phone, address, created_at
      FROM users
      WHERE email = ?
    `)
    .get(normalizedEmail);

  return mapUserRow(row);
};

export const listUsers = () => {
  const rows = getDb()
    .prepare(`
      SELECT id, name, email, password, role, phone, address, created_at
      FROM users
      ORDER BY datetime(created_at) DESC
    `)
    .all();

  return rows.map(mapUserRow);
};

export const createUser = ({ name, email, password, role = 'user', phone, address }) => {
  const normalizedName = trimText(name);
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = USER_ROLES.includes(role) ? role : 'user';

  if (!normalizedName) {
    throw new Error('Name is required');
  }

  if (!normalizedEmail || !validator.isEmail(normalizedEmail)) {
    throw new Error('Please provide a valid email');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = createEntityId();
  const createdAt = nowIso();

  try {
    getDb()
      .prepare(`
        INSERT INTO users (id, name, email, password, role, phone, address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        normalizedName,
        normalizedEmail,
        hashedPassword,
        normalizedRole,
        normalizeNullableText(phone),
        normalizeNullableText(address),
        createdAt
      );
  } catch (error) {
    if (uniqueConstraintFailed(error, 'users.email')) {
      throw new Error('User already exists with this email');
    }

    throw error;
  }

  return getUserById(id);
};

export const createRefreshTokenRecord = ({ userId, token, expires }) => {
  const id = createEntityId();
  const createdAt = nowIso();
  const expiresAt = expires instanceof Date ? expires.toISOString() : expires || null;

  getDb()
    .prepare(`
      INSERT INTO tokens (id, user_id, token, expires_at, revoked, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(id, userId, token, expiresAt, 0, createdAt);

  return findRefreshToken(token);
};

export const findRefreshToken = (token) => {
  const row = getDb()
    .prepare(`
      SELECT
        tokens.id,
        tokens.user_id,
        tokens.token,
        tokens.expires_at,
        tokens.revoked,
        tokens.created_at,
        users.id AS user_id,
        users.name AS user_name,
        users.email AS user_email,
        users.role AS user_role,
        users.phone AS user_phone,
        users.address AS user_address,
        users.created_at AS user_created_at
      FROM tokens
      LEFT JOIN users ON users.id = tokens.user_id
      WHERE tokens.token = ?
    `)
    .get(token);

  return mapTokenRow(row);
};

export const revokeRefreshToken = (token) => {
  getDb()
    .prepare(`
      UPDATE tokens
      SET revoked = 1
      WHERE token = ?
    `)
    .run(token);
};

export const createMedicineRecord = ({
  sellerId,
  medicineName,
  medicineSalt,
  shortDescription,
  expiryDate,
  medicineType,
  quantity,
  pricePerUnit,
  mrp,
  imageUrl,
  imagePublicId,
}) => {
  const id = createEntityId();
  const createdAt = nowIso();
  const updatedAt = createdAt;

  getDb()
    .prepare(`
      INSERT INTO medicines (
        id,
        seller_id,
        medicine_name,
        medicine_salt,
        short_description,
        expiry_date,
        medicine_type,
        quantity,
        price_per_unit,
        mrp,
        image_url,
        image_public_id,
        is_active,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      id,
      sellerId,
      trimText(medicineName),
      trimText(medicineSalt),
      trimText(shortDescription),
      expiryDate,
      MEDICINE_TYPES.includes(medicineType) ? medicineType : 'Other',
      quantity,
      pricePerUnit,
      mrp,
      trimText(imageUrl),
      normalizeNullableText(imagePublicId),
      1,
      createdAt,
      updatedAt
    );

  return getMedicineById(id);
};

export const listActiveMedicines = () => {
  const rows = getDb()
    .prepare(`
      SELECT
        medicines.id,
        medicines.seller_id,
        medicines.medicine_name,
        medicines.medicine_salt,
        medicines.short_description,
        medicines.expiry_date,
        medicines.medicine_type,
        medicines.quantity,
        medicines.price_per_unit,
        medicines.mrp,
        medicines.image_url,
        medicines.image_public_id,
        medicines.is_active,
        medicines.created_at,
        medicines.updated_at,
        users.id AS seller_id,
        users.name AS seller_name,
        users.email AS seller_email
      FROM medicines
      INNER JOIN users ON users.id = medicines.seller_id
      WHERE medicines.is_active = 1
      ORDER BY datetime(medicines.created_at) DESC
    `)
    .all();

  return rows.map(mapMedicineRow);
};

export const listMedicinesBySeller = (sellerId) => {
  const rows = getDb()
    .prepare(`
      SELECT
        medicines.id,
        medicines.seller_id,
        medicines.medicine_name,
        medicines.medicine_salt,
        medicines.short_description,
        medicines.expiry_date,
        medicines.medicine_type,
        medicines.quantity,
        medicines.price_per_unit,
        medicines.mrp,
        medicines.image_url,
        medicines.image_public_id,
        medicines.is_active,
        medicines.created_at,
        medicines.updated_at,
        users.id AS seller_id,
        users.name AS seller_name,
        users.email AS seller_email
      FROM medicines
      INNER JOIN users ON users.id = medicines.seller_id
      WHERE medicines.seller_id = ?
      ORDER BY datetime(medicines.created_at) DESC
    `)
    .all(sellerId);

  return rows.map(mapMedicineRow);
};

export const getMedicineById = (id) => {
  if (!isValidEntityId(id)) {
    return null;
  }

  const row = getDb()
    .prepare(`
      SELECT
        medicines.id,
        medicines.seller_id,
        medicines.medicine_name,
        medicines.medicine_salt,
        medicines.short_description,
        medicines.expiry_date,
        medicines.medicine_type,
        medicines.quantity,
        medicines.price_per_unit,
        medicines.mrp,
        medicines.image_url,
        medicines.image_public_id,
        medicines.is_active,
        medicines.created_at,
        medicines.updated_at,
        users.id AS seller_id,
        users.name AS seller_name,
        users.email AS seller_email
      FROM medicines
      INNER JOIN users ON users.id = medicines.seller_id
      WHERE medicines.id = ?
    `)
    .get(id);

  return mapMedicineRow(row);
};

export const deleteMedicineRecord = (id) => {
  const result = getDb()
    .prepare(`
      DELETE FROM medicines
      WHERE id = ?
    `)
    .run(id);

  return result.changes > 0;
};

export const createOrderRecord = ({
  buyerId,
  medicineName,
  medicineType,
  quantity,
  pricePerUnit,
  mrp,
  totalPrice,
  expiryDate,
  paymentMethod,
  shippingAddress,
  notes,
  paymentId,
  razorpayOrderId,
  paymentSignature,
}) => {
  const id = createEntityId();
  const createdAt = nowIso();
  const updatedAt = createdAt;

  getDb()
    .prepare(`
      INSERT INTO orders (
        id,
        buyer_id,
        medicine_name,
        medicine_type,
        quantity,
        price_per_unit,
        mrp,
        total_price,
        expiry_date,
        status,
        payment_method,
        shipping_address,
        notes,
        payment_id,
        razorpay_order_id,
        payment_signature,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      id,
      buyerId,
      trimText(medicineName),
      ORDER_MEDICINE_TYPES.includes(medicineType) ? medicineType : 'Other',
      quantity,
      pricePerUnit,
      mrp,
      totalPrice,
      expiryDate,
      'pending',
      trimText(paymentMethod),
      trimText(shippingAddress),
      normalizeNullableText(notes),
      normalizeNullableText(paymentId),
      normalizeNullableText(razorpayOrderId),
      normalizeNullableText(paymentSignature),
      createdAt,
      updatedAt
    );

  return getOrderById(id);
};

export const getOrdersByBuyer = (buyerId) => {
  const rows = getDb()
    .prepare(`
      SELECT
        orders.id,
        orders.buyer_id,
        orders.medicine_name,
        orders.medicine_type,
        orders.quantity,
        orders.price_per_unit,
        orders.mrp,
        orders.total_price,
        orders.expiry_date,
        orders.status,
        orders.payment_method,
        orders.shipping_address,
        orders.notes,
        orders.payment_id,
        orders.razorpay_order_id,
        orders.payment_signature,
        orders.created_at,
        orders.updated_at,
        users.id AS buyer_id,
        users.name AS buyer_name,
        users.email AS buyer_email,
        users.phone AS buyer_phone,
        users.address AS buyer_address,
        users.created_at AS buyer_created_at,
        users.role AS buyer_role
      FROM orders
      INNER JOIN users ON users.id = orders.buyer_id
      WHERE orders.buyer_id = ?
      ORDER BY datetime(orders.created_at) DESC
    `)
    .all(buyerId);

  return rows.map(mapOrderRow);
};

export const getOrderById = (id) => {
  if (!isValidEntityId(id)) {
    return null;
  }

  const row = getDb()
    .prepare(`
      SELECT
        orders.id,
        orders.buyer_id,
        orders.medicine_name,
        orders.medicine_type,
        orders.quantity,
        orders.price_per_unit,
        orders.mrp,
        orders.total_price,
        orders.expiry_date,
        orders.status,
        orders.payment_method,
        orders.shipping_address,
        orders.notes,
        orders.payment_id,
        orders.razorpay_order_id,
        orders.payment_signature,
        orders.created_at,
        orders.updated_at,
        users.id AS buyer_id,
        users.name AS buyer_name,
        users.email AS buyer_email,
        users.phone AS buyer_phone,
        users.address AS buyer_address,
        users.created_at AS buyer_created_at,
        users.role AS buyer_role
      FROM orders
      INNER JOIN users ON users.id = orders.buyer_id
      WHERE orders.id = ?
    `)
    .get(id);

  return mapOrderRow(row);
};

export const updateOrderStatus = (id, status) => {
  const updatedAt = nowIso();

  const result = getDb()
    .prepare(`
      UPDATE orders
      SET status = ?, updated_at = ?
      WHERE id = ?
    `)
    .run(status, updatedAt, id);

  if (result.changes === 0) {
    return null;
  }

  return getOrderById(id);
};

export const listAllOrders = () => {
  const rows = getDb()
    .prepare(`
      SELECT
        orders.id,
        orders.buyer_id,
        orders.medicine_name,
        orders.medicine_type,
        orders.quantity,
        orders.price_per_unit,
        orders.mrp,
        orders.total_price,
        orders.expiry_date,
        orders.status,
        orders.payment_method,
        orders.shipping_address,
        orders.notes,
        orders.payment_id,
        orders.razorpay_order_id,
        orders.payment_signature,
        orders.created_at,
        orders.updated_at,
        users.id AS buyer_id,
        users.name AS buyer_name,
        users.email AS buyer_email,
        users.phone AS buyer_phone,
        users.address AS buyer_address,
        users.created_at AS buyer_created_at,
        users.role AS buyer_role
      FROM orders
      INNER JOIN users ON users.id = orders.buyer_id
      ORDER BY datetime(orders.created_at) DESC
    `)
    .all();

  return rows.map(mapOrderRow);
};

export { isValidEntityId };
