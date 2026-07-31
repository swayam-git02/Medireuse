import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_DB_DIRECTORY = fileURLToPath(new URL('../../data/', import.meta.url));
const DEFAULT_DB_PATH = path.join(DEFAULT_DB_DIRECTORY, 'medireuse.sqlite');

const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    phone TEXT,
    address TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT,
    revoked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS medicines (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL,
    medicine_name TEXT NOT NULL,
    medicine_salt TEXT NOT NULL,
    short_description TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    medicine_type TEXT NOT NULL DEFAULT 'Other'
      CHECK (medicine_type IN ('Tablet', 'Capsule', 'Syrup', 'Supplement', 'Other')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    price_per_unit REAL NOT NULL DEFAULT 0 CHECK (price_per_unit >= 0),
    mrp REAL NOT NULL DEFAULT 0 CHECK (mrp >= 0),
    image_url TEXT NOT NULL,
    image_public_id TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    medicine_name TEXT NOT NULL,
    medicine_type TEXT NOT NULL
      CHECK (medicine_type IN ('Tablet', 'Capsule', 'Syrup', 'Supplement', 'Other', 'Verified')),
    quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 100),
    price_per_unit REAL NOT NULL CHECK (price_per_unit >= 0),
    mrp REAL NOT NULL DEFAULT 0 CHECK (mrp >= 0),
    total_price REAL NOT NULL CHECK (total_price >= 0),
    expiry_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    notes TEXT,
    payment_id TEXT,
    razorpay_order_id TEXT,
    payment_signature TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
  CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_medicines_seller_id ON medicines(seller_id);
  CREATE INDEX IF NOT EXISTS idx_medicines_is_active ON medicines(is_active);
  CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
`;

let database = null;
let currentLocation = null;

const resolveDatabaseLocation = (location) => {
  const candidate = location || process.env.SQLITE_DB_PATH || DEFAULT_DB_PATH;

  if (candidate === ':memory:') {
    return candidate;
  }

  const resolvedPath = path.isAbsolute(candidate) ? candidate : path.resolve(candidate);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  return resolvedPath;
};

const initializeDatabase = (db, location) => {
  if (location !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }

  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);
};

export const connectDB = (location) => {
  const resolvedLocation = resolveDatabaseLocation(location);

  if (database && currentLocation === resolvedLocation) {
    return database;
  }

  if (database) {
    closeDB();
  }

  database = new DatabaseSync(resolvedLocation);
  currentLocation = resolvedLocation;
  initializeDatabase(database, resolvedLocation);

  return database;
};

export const getDb = () => {
  if (!database) {
    connectDB();
  }

  return database;
};

export const closeDB = () => {
  if (!database) {
    return;
  }

  database.close();
  database = null;
  currentLocation = null;
};

export const resetDB = () => {
  const db = getDb();
  db.exec(`
    DELETE FROM tokens;
    DELETE FROM orders;
    DELETE FROM medicines;
    DELETE FROM users;
  `);
};

export const getDatabaseLocation = () => currentLocation || resolveDatabaseLocation();

export default connectDB;
