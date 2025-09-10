// scripts/init-db.js
const { Pool } = require('@neondatabase/serverless');

async function initDB() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS materiales (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        precio_por_metro DECIMAL(10, 2) NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS prendas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio_fabricacion DECIMAL(10, 2),
        precio_venta DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS materiales_por_prenda (
        id SERIAL PRIMARY KEY,
        prenda_id INTEGER REFERENCES prendas(id) ON DELETE CASCADE,
        material_id INTEGER REFERENCES materiales(id) ON DELETE CASCADE,
        talla VARCHAR(10) NOT NULL,
        cantidad DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Tablas creadas exitosamente');
  } catch (error) {
    console.error('Error creando tablas:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();