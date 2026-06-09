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
function validarActividad(datos) {
    const errores = [];

    if (datos.precio === undefined || datos.precio === null || datos.precio === '') {
        errores.push('El precio es obligatorio');
    } else {
        const precio = parseFloat(datos.precio);
        if (isNaN(precio) || precio <= 0) {
            errores.push('El precio debe ser un número mayor que 0');
        }
    }

    if (!datos.marca || typeof datos.marca !== 'string' || datos.marca.trim().length < 2) {
        errores.push('La marca del producto es obligatoria (mínimo 2 caracteres)');
    }

    return errores;
}

// ============================================================
// GET /api/productos — Listar todos
// ============================================================
router.get('/', async (req, res) => {
    try {
        const [actividad] = await db.execute(
            'SELECT id_guitarra, precio, marca, n_trastes, color created_at, updated_at FROM productos ORDER BY id ASC'
        );

        res.json({
            status: 'success',
            data: actividad,
            count: actividad.length
        });

    } catch (error) {
        console.error('Error al listar las guitarras:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// GET /api/productos/:id — Obtener uno
// ============================================================
router.get('/:id_guitarra', async (req, res) => {
    try {
        const { id_guitarra } = req.params;
        const [actividad] = await db.execute(
            'SELECT id_guitarra, precio, marca, n_trastes, color, created_at, updated_at FROM productos WHERE id = ?',
            [id_guitarra]
        );

        if (actividad.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Guitarra con ID ${id} no encontrado`
            });
        }

        res.json({ status: 'success', data: productos[0] });

    } catch (error) {
        console.error('Error al obtener la guitarra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// POST /api/productos — Crear nuevo
// ============================================================
router.post('/', async (req, res) => {
    try {
        const errores = validarActividad(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

// Continuar aqui

        const { precio, marca, n_trastes, color } = req.body;

        const [resultado] = await db.execute(
            'INSERT INTO productos (precio, marca, n_trastes, color) VALUES (?, ?)',
            [marca.trim(), parseFloat(precio)]
        );

        const [nuevo] = await db.execute(
            'SELECT id_guitarra, precio, marca, n_trastes, color, created_at FROM productos WHERE id = ?',
            [resultado.insertId]
        );

        res.status(201).json({ status: 'success', data: nuevo[0] });

    } catch (error) {
        console.error('Error al incertar la guitarra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// PUT /api/productos/:id — Actualizar
// ============================================================
router.put('/:id_guitarra', async (req, res) => {
    try {
        const { id_guitarra } = req.params;

        const [existente] = await db.execute('SELECT id_guitarra FROM guitarraactividad WHERE id = ?', [id_guitarra]);
        if (existente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${id_guitarra} no encontrado`
            });
        }

        const errores = validarActividad(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { precio, marca, n_trastes, color } = req.body;

        await db.execute(
            'UPDATE guitarraactividad SET precio = ?, marca = ?, n_trastes = ?, color = ? WHERE id_guitarra = ?',
            [marca.trim(), parseFloat(precio), id_guitarra]
        );

        const [actualizado] = await db.execute(
            'SELECT id_guitarra, precio, marca, n_trastes, color, created_at, updated_at FROM productos WHERE id_guitarra = ?',
            [id_guitarra]
        );

        res.json({ status: 'success', data: actualizado[0] });

    } catch (error) {
        console.error('Error al actualizar la guitarra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// DELETE /api/productos/:id — Eliminar
// ============================================================
// Si el producto tiene compras asociadas, MySQL rechazará
// la eliminación gracias a ON DELETE RESTRICT.
router.delete('/:id_guitarra', async (req, res) => {
    try {
        const { id_guitarra } = req.params;

        const [actividad] = await db.execute(
            'SELECT id_guitarra, marca, n_trastes, color FROM guitarraactividad WHERE id_guitarra = ?', [id_guitarra]
        );

        if (actividad.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `guitarra con ID ${id_guitarra} no encontrado`
            });
        }

        await db.execute('DELETE FROM guitarraactividad WHERE id_guitarra = ?', [id_guitarra]);

        res.json({
            status: 'success',
            data: {
                eliminado: actividad[0],
                mensaje: `Producto "${actividad[0].nombre}" eliminado`
            }
        });

    } catch (error) {
        // Error de FK: el producto tiene compras asociadas
        // MySQL error code 1451 = Cannot delete or update a parent row
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(409).json({
                status: 'error',
                message: 'No se puede eliminar la guitarra porque tiene compras asociadas'
            });
        }
        console.error('Error al eliminar la guitarra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;