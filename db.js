import sqlite3 from 'sqlite3';
import { open } from 'sqlite'; // instalamos también: npm install sqlite

async function abrirDB() {
  return open({
    filename: './ecommerce.db', // Esto crea un archivo llamado ecommerce.db en tu carpeta
    driver: sqlite3.Database
  });
}

export default abrirDB;