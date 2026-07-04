// import abrirDB from '../db.js';

// // 1. Obtener todos los registros (Read)
// export const getAll = async (table) => {
//   const db = await abrirDB();
//   return await db.all(`SELECT * FROM ${table}`);
// };

// // 2. Insertar un registro (Create)
// export const create = async (table, data) => {
//   const db = await abrirDB();
//   const keys = Object.keys(data).join(', ');
//   const values = Object.values(data);
//   const placeholders = values.map(() => '?').join(', ');
  
//   const result = await db.run(
//     `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`,
//     values
//   );
//   return { id: result.lastID, ...data };
// };

// // 3. Actualizar un registro (Update)
// export const update = async (table, id, data) => {
//   const db = await abrirDB();
//   const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
//   const values = [...Object.values(data), id];
  
//   return await db.run(
//     `UPDATE ${table} SET ${fields} WHERE id = ?`,
//     values
//   );
// };

// // 4. Eliminar un registro (Delete)
// export const remove = async (table, id) => {
//   const db = await abrirDB();
//   return await db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
// };



import pool from '../db.js';

// 1. Obtener todos los registros (Read)
export const getAll = async (table) => {
  // pool.query devuelve un objeto donde los resultados están en la propiedad 'rows'
  const { rows } = await pool.query(`SELECT * FROM ${table}`);
  return rows;
};

// 2. Insertar un registro (Create)
export const create = async (table, data) => {
  const keys = Object.keys(data).join(', ');
  const values = Object.values(data);
  
  // Postgres usa $1, $2, $3 en lugar de ?, ?, ?
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  
  // Agregamos "RETURNING id" para obtener el id autogenerado (reemplaza a result.lastID)
  const result = await pool.query(
    `INSERT INTO ${table} (${keys}) VALUES (${placeholders}) RETURNING id`,
    values
  );
  
  return { id: result.rows[0].id, ...data };
};

// 3. Actualizar un registro (Update)
export const update = async (table, id, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  // Generamos algo como: "nombre = $1, precio = $2"
  const fields = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  
  // Añadimos el ID al final del arreglo de valores
  values.push(id);
  const idPlaceholder = `$${values.length}`; // Si hay 2 campos, el id será $3
  
  // Agregamos RETURNING * por si necesitas ver qué datos quedaron finalmente en la BD
  const result = await pool.query(
    `UPDATE ${table} SET ${fields} WHERE id = ${idPlaceholder} RETURNING *`,
    values
  );
  
  return result.rows[0];
};

// 4. Eliminar un registro (Delete)
export const remove = async (table, id) => {
  // Usamos $1 para el ID
  const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0]; // Retorna el registro eliminado, por si lo ocupas
};