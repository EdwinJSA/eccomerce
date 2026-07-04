import pg from 'pg';
import 'dotenv/config'; // Esta es la sintaxis correcta para ES Modules

const { Pool } = pg;

const pool = new Pool({
  // Se corrigió 'procces.Database_URL' a 'process.env.DATABASE_URL'
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido por Render para conexiones externas
  }
});

export default pool;