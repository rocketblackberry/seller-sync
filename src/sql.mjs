import { sql } from "@vercel/postgres";

async function createTable() {
  // items
  await sql`CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    item_id VARCHAR(20),
    source_item_id VARCHAR(20),
    maker VARCHAR(255),
    series VARCHAR(255),
    name VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    images TEXT[],
    condition VARCHAR(255),
    condition_description TEXT,
    category_id VARCHAR(20),
    specs JSONB,
    price DECIMAL(8, 2),
    stock INT,
    supplier VARCHAR(20),
    supplier_url VARCHAR(255),
    cost INT,
    weight DECIMAL(4, 1),
    freight INT,
    shipping_policy VARCHAR(20),
    promote DECIMAL(4, 1),
    status VARCHAR(20),
    view INT,
    watch INT,
    sold INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP
  );`;

  // items2
  await sql`CREATE TABLE items2 (
    id BIGSERIAL PRIMARY KEY,
    item_id VARCHAR(20) UNIQUE,
    keyword VARCHAR(255),
    title VARCHAR(255),
    image VARCHAR(255),
    condition VARCHAR(255),
    condition_description TEXT,
    price DECIMAL(8, 2),
    stock INT,
    cost INT,
    weight DECIMAL(4, 1),
    freight INT,
    promote DECIMAL(4, 1),
    supplier_url VARCHAR(255),
    status VARCHAR(20),
    view INT,
    watch INT,
    sold INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;
}

createTable();
