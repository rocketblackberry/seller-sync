import { sql } from "@vercel/postgres";

async function createTable() {
  // condition
  await sql`CREATE TYPE condition AS ENUM ('new', 'used');`;

  // status
  await sql`CREATE TYPE status AS ENUM ('active', 'draft', 'deleted');`;

  // items
  await sql`CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    item_id VARCHAR(20) UNIQUE,
    keyword VARCHAR(255),
    title VARCHAR(255),
    image VARCHAR(255),
    condition condition,
    description TEXT,
    description_ja TEXT,
    supplier_url VARCHAR(255),
    price DECIMAL(7, 2),
    cost INT,
    weight DECIMAL(3, 1),
    freight INT,
    profit INT,
    profit_rate DECIMAL(3, 1),
    fvf_rate DECIMAL(3, 1),
    promote_rate DECIMAL(3, 1),
    stock INT,
    status status,
    view INT,
    watch INT,
    sold INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;
}

createTable();
