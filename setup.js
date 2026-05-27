import abrirDB from './db.js';

async function setup() {
  const db = await abrirDB();
  
  // await db.exec(`
  //   CREATE TABLE IF NOT EXISTS usuarios (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     nombre TEXT NOT NULL,
  //     email TEXT UNIQUE NOT NULL,
  //     password TEXT NOT NULL
  //   );

  //   CREATE TABLE IF NOT EXISTS articulos (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     nombre TEXT NOT NULL,
  //     descripcion TEXT,
  //     precio REAL NOT NULL,
  //     stock INTEGER NOT NULL
  //   );

  //   CREATE TABLE IF NOT EXISTS compras (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     usuarios_id INTEGER,
  //     fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  //     total REAL,
  //     FOREIGN KEY (usuarios_id) REFERENCES usuarios(id)
  //   );

  //   CREATE TABLE IF NOT EXISTS detalle_compras (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     compras_id INTEGER,
  //     articulos_id INTEGER,
  //     cantidad INTEGER NOT NULL,
  //     FOREIGN KEY (compras_id) REFERENCES compras(id),
  //     FOREIGN KEY (articulos_id) REFERENCES articulos(id)
  //   );
  // `);

  await db.exec(`
    ALTER TABLE articulos
    ADD COLUMN imagen TEXT;
  `);
  
  console.log("se agrego la nueva columna de la tabla");
}

setup();