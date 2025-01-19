import { sql } from "@vercel/postgres";

async function createTable() {
  await sql`CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    ebay_id VARCHAR(10),
    source_ebay_id VARCHAR(10),
    maker VARCHAR(255),
    series VARCHAR(255),
    name VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    images TEXT[],
    condition VARCHAR(255),
    condition_description TEXT,
    category_id VARCHAR(10),
    specs JSONB,
    price DECIMAL(8, 2),
    stock INT,
    supplier VARCHAR(50),
    supplier_url VARCHAR(255),
    cost INT,
    weight DECIMAL(4, 1),
    freight INT,
    shipping_policy VARCHAR(50),
    promote DECIMAL(4, 1),
    status VARCHAR(255),
    view INT,
    watch INT,
    sold INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP
  );`;
}

createTable();
