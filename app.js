import express from 'express';
import path from 'path'; // Needed for path resolution
import { fileURLToPath } from 'url';
import abrirDB from './db.js';
import { getAll, create, update, remove } from './utils/crud.js';

const app = express();
const PORT = 3000;

// Setup for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Configure the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Assuming your files are in a 'views' folder
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON
app.use(express.json());

// 2. Correct route handler
app.get('/', (req, res) => {
    res.render('index'); // No need to include '.ejs' if the engine is set
});

app.get('/carrito', (req, res) => {
    res.render('carrito'); // No need to include '.ejs' if the engine is set
});

app.get('/historial', (req, res) => {
    res.render('historial'); // No need to include '.ejs' if the engine is set
});

app.get('/registrar', (req, res) => {
    res.render('registar');
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


// ===================== COMPRAS ==========================
app.get('/verProductosPorCompra/:id', async (req, res) => {
    const query = 
        `
        SELECT 
            a.nombre AS articulo,
            a.imagen AS imagen,
            dc.cantidad AS cantidad,
            a.precio AS precio_unitario
        FROM detalle_compras dc
        JOIN articulos a ON dc.articulos_id = a.id
        WHERE dc.compras_id = ?;
        `;
    const db = await abrirDB();
    const compras = await db.all(query, [req.params.id]);
    console.table(compras);
    return res.json(compras);
})



app.get('/historialCompras', async (req, res) => {
    const query = `
        SELECT 
            compras.id AS compra_id,
            usuarios.nombre AS nombre_usuario,
            compras.total,
            compras.fecha
        FROM compras
        JOIN usuarios ON compras.usuarios_id = usuarios.id
    `;
    const db = await abrirDB();
    const compras = await db.all(query);
    return res.json(compras);
});


// ==================== PAGOS ==================================
app.post('/procesarPago', async (req, res) => {
    try {
        const { usuario, carrito } = req.body;
        const db = await abrirDB();

        // 1. Buscar si el usuario ya existe para no duplicarlo
        let user = await db.get('SELECT id FROM usuarios WHERE nombre = ?', [usuario]);
        let userId;

        if (!user) {
            const nuevoUsuario = await create('usuarios', { 
                nombre: usuario,
                email: `${usuario}@example.com`,
                password: `${usuario}password`
            });
            userId = nuevoUsuario.id;
            console.log('Nuevo usuario creado con ID:', userId);
        } else {
            userId = user.id;
            console.log('Usuario existente encontrado con ID:', userId);
        }

        const total = carrito.reduce((acumulador, producto) => {
            return acumulador + (producto.precio * producto.cantidad);
        }, 0);

        const fecha = new Date().toISOString();

       let compra = await db.run('INSERT INTO compras (usuarios_id, fecha, total) VALUES (?, ?, ?)', [userId, fecha, total]);

        const compraId = compra.lastID;

        carrito.forEach(async (producto) => {
            await db.run('INSERT INTO detalle_compras (compras_id, articulos_id, cantidad) VALUES (?, ?, ?)', [compraId, producto.id, producto.cantidad]);
        });
        
        res.json({ success: true });

    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// ==================== USUARIOS ===============================
app.post('/crearUsuario', (req, res) => {
    const datos = {
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password
    }

    create('usuarios', datos);
    return res.status(201).json({message: 'Usuario creado'});
})

app.get('/obtenerUsuarios', async (req, res) => {
    const usuarios = await getAll('usuarios');
    return res.json(usuarios);
})


// ==================== PRODUCTOS ===============================
app.post('/crearProducto', (req, res) => {
    try{
        const datos = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            stock: req.body.stock,
            imagen: req.body.imagen
        }

        create('articulos', datos);
    }
    catch(err){
        console.log(err);
        res.render('/registar', {message: 'Error al crear el producto'});
    }

    res.render('/registar', {message: 'Producto creado'});
})

app.get('/obtenerProductos', async (req, res) => {
    const productos = await getAll('articulos');
    return res.json(productos);
})

app.get('/obtenerProducto/:id', async (req, res) => {
    const producto = await getAll('articulos', req.params.id);
    return res.json(producto);
})

app.delete('/eliminarProducto/:id', async (req, res) => {
    const producto = await remove('articulos', req.params.id);
    return res.json(producto);
})


//==================== COMPRAS ===============================
app.post('/crearCompra', async (req, res) => {
    // {
    //     "usuarios_id": 1,
    //     "total": 150.50,
    //     "items": [
    //         { "articulos_id": 101, "cantidad": 2 },
    //         { "articulos_id": 105, "cantidad": 1 }
    //     ]
    // }
    const { usuarios_id, total, items } = req.body; 
    // items será un array como: [{ articulos_id: 1, cantidad: 2 }, ...]
    
    const db = await abrirDB();

    try {
        // 1. Iniciamos una transacción
        await db.run('BEGIN TRANSACTION');

        // 2. Insertamos la compra
        const resultCompra = await db.run(
            'INSERT INTO compras (usuarios_id, total) VALUES (?, ?)',
            [usuarios_id, total]
        );
        const compras_id = resultCompra.lastID;

        // 3. Insertamos cada detalle
        for (const item of items) {
            await db.run(
                'INSERT INTO detalle_compras (compras_id, articulos_id, cantidad) VALUES (?, ?, ?)',
                [compras_id, item.articulos_id, item.cantidad]
            );
        }

        // 4. Si todo salió bien, guardamos los cambios
        await db.run('COMMIT');
        res.status(201).json({ message: 'Compra y detalles registrados exitosamente', compras_id });

    } catch (error) {
        // 5. Si algo falló, revertimos todo lo anterior (Rollback)
        await db.run('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error al procesar la compra', details: error.message });
    }
});


export default app; 