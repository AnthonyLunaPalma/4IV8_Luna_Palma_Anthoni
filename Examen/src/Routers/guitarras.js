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
function validarGuitarra(datos) {
    const errores = [];

    if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2) {
        errores.push('El nombre de la guitarra es obligatorio (mínimo 2 caracteres)');
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
// GET /api/guitarras — Listar todos
// ============================================================
router.get('/', async (req, res) => {
    try {
        const [guitarras] = await db.execute(
            'SELECT id, nombre, precio, created_at, updated_at FROM guitarras ORDER BY id ASC'
        );

        res.json({
            status: 'success',
            data: guitarras,
            count: guitarras.length
        });

    } catch (error) {
        console.error('Error al listar guitarras:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// GET /api/guitarras/:id — Obtener una por ID
// ============================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [guitarras] = await db.execute(
            'SELECT id, nombre, precio, created_at, updated_at FROM guitarras WHERE id = ?',
            [id]
        );

        if (guitarras.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Guitarra con ID ${id} no encontrada`
            });
        }

        res.json({ status: 'success', data: guitarras[0] });

    } catch (error) {
        console.error('Error al obtener guitarra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// POST /api/guitarras — Crear nueva
// ============================================================
router.post('/', async (req, res) => {
    try {
        const errores = validarGuitarra(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, precio } = req.body;

        const [resultado] = await db.execute(
            'INSERT INTO guitarras (nombre, precio) VALUES (?, ?)',
            [nombre.trim(), parseFloat(precio)]
        );

        const [nuevo] = await db.execute(
            'SELECT id, nombre, precio, created_at FROM guitarras WHERE id = ?',
            [resultado.insertId]
        );

        res.status(201).json({ status: 'success', data: nuevo[0] });

    } catch (error) {
        console.error('Error al crear guitarra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// PUT /api/guitarras/:id — Actualizar
// ============================================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existente] = await db.execute('SELECT id FROM guitarras WHERE id = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Guitarra con ID ${id} no encontrada`
            });
        }

        const errores = validarGuitarra(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, precio } = req.body;

        await db.execute(
            'UPDATE guitarras SET nombre = ?, precio = ? WHERE id = ?',
            [nombre.trim(), parseFloat(precio), id]
        );

        const [actualizado] = await db.execute(
            'SELECT id, nombre, precio, created_at, updated_at FROM guitarras WHERE id = ?',
            [id]
        );

        res.json({ status: 'success', data: actualizado[0] });

    } catch (error) {
        console.error('Error al actualizar guitarra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// DELETE /api/guitarras/:id — Eliminar
// ============================================================
// Si la guitarra tiene compras asociadas, MySQL rechazará
// la eliminación gracias a ON DELETE RESTRICT.
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [guitarra] = await db.execute(
            'SELECT id, nombre FROM guitarras WHERE id = ?', [id]
        );

        if (guitarra.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Guitarra con ID ${id} no encontrada`
            });
        }

        await db.execute('DELETE FROM guitarras WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: {
                eliminado: guitarra[0],
                mensaje: `Guitarra "${guitarra[0].nombre}" eliminada`
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