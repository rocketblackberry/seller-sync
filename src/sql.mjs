import { sql } from "@vercel/postgres";

async function createTable() {
  // condition
  await sql`CREATE TYPE condition AS ENUM ('new', 'used');`;

  // status
  await sql`CREATE TYPE status AS ENUM ('active', 'inactive', 'deleted');`;

  // role
  await sql`CREATE TYPE role AS ENUM ('admin', 'user');`;

  // users
  await sql`CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    sub VARCHAR(255) UNIQUE, -- auth0 sub
    email VARCHAR(255) UNIQUE,
    role role,
    status status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;

  // sellers
  await sql`CREATE TABLE sellers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    seller_id VARCHAR(255) UNIQUE, -- eBay seller id
    name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    status status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, seller_id)
  );`;

  // items
  await sql`CREATE TABLE items (
    id VARCHAR(255) PRIMARY KEY, -- ebay
    seller_id BIGINT REFERENCES sellers(id) NOT NULL,
    keyword VARCHAR(255) DEFAULT '',
    title VARCHAR(255) DEFAULT '', -- ebay
    image VARCHAR(255) DEFAULT '', -- ebay
    condition condition DEFAULT 'used', -- ebay
    description TEXT DEFAULT '',
    description_ja TEXT DEFAULT '',
    supplier_url TEXT DEFAULT '',
    price DECIMAL(7, 2) DEFAULT 0,
    cost INT DEFAULT 0,
    weight DECIMAL(3, 1) DEFAULT 1.0,
    freight INT DEFAULT 0,
    profit INT DEFAULT 0,
    profit_rate DECIMAL(3, 1) DEFAULT 10.0,
    fvf_rate DECIMAL(3, 1) DEFAULT 13.0,
    promote_rate DECIMAL(3, 1) DEFAULT 2.0,
    stock INT DEFAULT 0, -- ebay
    view INT DEFAULT 0, -- ebay
    watch INT DEFAULT 0, -- ebay
    sold INT DEFAULT 0, -- ebay
    status status DEFAULT 'active', -- ebay
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;
}

createTable();
