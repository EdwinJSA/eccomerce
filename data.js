import abrirDB from './db.js';

async function setup() {
  const db = await abrirDB();
  
  await db.exec(`
    INSERT INTO articulos (nombre, descripcion, precio, stock, imagen) VALUES
    ('Zapatillas', 'Estas son unas zapatillas formales', 10.99, 100, 'https://cdn.pixabay.com/photo/2021/03/08/12/31/oxford-shoes-6078993_1280.jpg')
  `);
  
  console.log("=> DATOS INSERTADOS");
}

setup();