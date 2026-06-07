// ============================================================
// PRÁCTICA 3 - PNT: Rutas de Productos (Express Router)
// ============================================================
// CRUD completo para la tabla de productos.
// Estructura idéntica al router de usuarios.
//
// IMPORTANTE: Al eliminar un producto, la FK con ON DELETE RESTRICT
// impedirá la eliminación si tiene compras asociadas.
// Esto protege la integridad de los datos históricos.
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../DB/database');

// ============================================================
// FUNCIÓN: Validar datos de producto
// ============================================================
function validarProducto(datos) {
    const errores = [];

    if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2) {
        errores.push('El nombre del producto es obligatorio (mínimo 2 caracteres)');
    }

    if (datos.precio === undefined || datos.precio === null || datos.precio === '') {
        errores.push('El precio es obligatorio');
    } else {
        const precio = parseFloat(datos.precio);
        if (isNaN(precio) || precio <= 0) {
            errores.push('El precio debe ser un número mayor que 0');
        }
    }

    return errores;
}

// ============================================================
// GET /api/productos — Listar todos
// ============================================================
router.get('/', async (req, res) => {
    try {
        const [productos] = await db.execute(
            'SELECT id, nombre, precio, created_at, updated_at FROM productos ORDER BY id ASC'
        );

        res.json({
            status: 'success',
            data: productos,
            count: productos.length
        });

    } catch (error) {
        console.error('Error al listar productos:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// GET /api/productos/:id — Obtener uno
// ============================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [productos] = await db.execute(
            'SELECT id, nombre, precio, created_at, updated_at FROM productos WHERE id = ?',
            [id]
        );

        if (productos.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${id} no encontrado`
            });
        }

        res.json({ status: 'success', data: productos[0] });

    } catch (error) {
        console.error('Error al obtener producto:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// POST /api/productos — Crear nuevo
// ============================================================
router.post('/', async (req, res) => {
    try {
        const errores = validarProducto(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, precio } = req.body;

        const [resultado] = await db.execute(
            'INSERT INTO productos (nombre, precio) VALUES (?, ?)',
            [nombre.trim(), parseFloat(precio)]
        );

        const [nuevo] = await db.execute(
            'SELECT id, nombre, precio, created_at FROM productos WHERE id = ?',
            [resultado.insertId]
        );

        res.status(201).json({ status: 'success', data: nuevo[0] });

    } catch (error) {
        console.error('Error al crear producto:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// PUT /api/productos/:id — Actualizar
// ============================================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existente] = await db.execute('SELECT id FROM productos WHERE id = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${id} no encontrado`
            });
        }

        const errores = validarProducto(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, precio } = req.body;

        await db.execute(
            'UPDATE productos SET nombre = ?, precio = ? WHERE id = ?',
            [nombre.trim(), parseFloat(precio), id]
        );

        const [actualizado] = await db.execute(
            'SELECT id, nombre, precio, created_at, updated_at FROM productos WHERE id = ?',
            [id]
        );

        res.json({ status: 'success', data: actualizado[0] });

    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// DELETE /api/productos/:id — Eliminar
// ============================================================
// Si el producto tiene compras asociadas, MySQL rechazará
// la eliminación gracias a ON DELETE RESTRICT.
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [producto] = await db.execute(
            'SELECT id, nombre FROM productos WHERE id = ?', [id]
        );

        if (producto.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${id} no encontrado`
            });
        }

        await db.execute('DELETE FROM productos WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: {
                eliminado: producto[0],
                mensaje: `Producto "${producto[0].nombre}" eliminado`
            }
        });

    } catch (error) {
        // Error de FK: el producto tiene compras asociadas
        // MySQL error code 1451 = Cannot delete or update a parent row
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(409).json({
                status: 'error',
                message: 'No se puede eliminar el producto porque tiene compras asociadas'
            });
        }
        console.error('Error al eliminar producto:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;