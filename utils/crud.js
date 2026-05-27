import abrirDB from '../db.js';

// 1. Obtener todos los registros (Read)
export const getAll = async (table) => {
  const db = await abrirDB();
  return await db.all(`SELECT * FROM ${table}`);
};

// 2. Insertar un registro (Create)
export const create = async (table, data) => {
  const db = await abrirDB();
  const keys = Object.keys(data).join(', ');
  const values = Object.values(data);
  const placeholders = values.map(() => '?').join(', ');
  
  const result = await db.run(
    `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`,
    values
  );
  return { id: result.lastID, ...data };
};

// 3. Actualizar un registro (Update)
export const update = async (table, id, data) => {
  const db = await abrirDB();
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  return await db.run(
    `UPDATE ${table} SET ${fields} WHERE id = ?`,
    values
  );
};

// 4. Eliminar un registro (Delete)
export const remove = async (table, id) => {
  const db = await abrirDB();
  return await db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
};