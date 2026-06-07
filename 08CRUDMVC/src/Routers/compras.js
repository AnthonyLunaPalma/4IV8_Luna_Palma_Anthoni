// ============================================================
// PRÁCTICA 3 - PNT: Rutas de Compras (Express Router)
// ============================================================
// Este es el router más interesante porque trabaja con RELACIONES.
//
// CONCEPTOS CLAVE:
// - JOIN: combinar datos de varias tablas en una sola consulta
// - INNER JOIN: solo muestra registros con coincidencia en ambas tablas
// - Foreign Keys: las compras DEBEN referenciar un usuario y producto existentes
// - Transacciones implícitas: MySQL asegura que cada INSERT es atómico
//
// ENDPOINTS:
// GET    /api/compras         → Listar todas (con datos de usuario y producto)
// GET    /api/compras/:id     → Obtener una compra específica
// GET    /api/compras/usuario/:id → Compras de un usuario específico
// POST   /api/compras         → Registrar nueva compra
// DELETE /api/compras/:id     → Eliminar una compra
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../DB/database');

// ============================================================
// FUNCIÓN: Validar datos de compra
// ============================================================
function validarCompra(datos) {
    const errores = [];

    if (!datos.usuario_id) {
        errores.push('El ID del usuario es obligatorio');
    } else if (!Number.isInteger(Number(datos.usuario_id)) || Number(datos.usuario_id) <= 0) {
        errores.push('El ID del usuario debe ser un número entero positivo');
    }

    if (!datos.producto_id) {
        errores.push('El ID del producto es obligatorio');
    } else if (!Number.isInteger(Number(datos.producto_id)) || Number(datos.producto_id) <= 0) {
        errores.push('El ID del producto debe ser un número entero positivo');
    }

    if (datos.cantidad !== undefined) {
        const cant = Number(datos.cantidad);
        if (!Number.isInteger(cant) || cant <= 0) {
            errores.push('La cantidad debe ser un número entero mayor que 0');
        }
    }

    return errores;
}

// ============================================================
// GET /api/compras — Listar todas las compras
// ============================================================
// Esta consulta usa INNER JOIN para obtener datos de 3 tablas
// en una sola petición. Sin JOIN, necesitaríamos 3 consultas
// separadas y combinar los datos en JavaScript.
//
// INNER JOIN funciona así:
// 1. Toma la tabla principal (compras, alias 'c')
// 2. Para cada fila de compras, busca la fila coincidente en usuarios
//    donde c.usuario_id = u.id
// 3. Luego busca la fila coincidente en productos
//    donde c.producto_id = p.id
// 4. Combina todo en una sola fila de resultado
//
// Aliases (AS):
// - c = compras, u = usuarios, p = productos
// - Permiten escribir consultas más cortas y legibles
router.get('/', async (req, res) => {
    try {
        const [compras] = await db.execute(`
            SELECT
                c.id,
                c.usuario_id,
                u.nombre AS usuario_nombre,
                u.email AS usuario_email,
                c.producto_id,
                p.nombre AS producto_nombre,
                p.precio AS producto_precio,
                c.cantidad,
                (p.precio * c.cantidad) AS total,
                c.fecha_compra
            FROM compras c
            INNER JOIN usuarios u ON c.usuario_id = u.id
            INNER JOIN productos p ON c.producto_id = p.id
            ORDER BY c.fecha_compra DESC
        `);

        res.json({
            status: 'success',
            data: compras,
            count: compras.length
        });

    } catch (error) {
        console.error('Error al listar compras:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// GET /api/compras/:id — Obtener una compra por ID
// ============================================================
router.get('/:id', async (req, res) => {
    try {
        // Verificar que el parámetro no sea "usuario" (para evitar
        // conflicto con la ruta /api/compras/usuario/:id)
        if (req.params.id === 'usuario') {
            return res.status(400).json({
                status: 'error',
                message: 'Usa /api/compras/usuario/:usuario_id para buscar por usuario'
            });
        }

        const { id } = req.params;

        const [compras] = await db.execute(`
            SELECT
                c.id,
                c.usuario_id,
                u.nombre AS usuario_nombre,
                c.producto_id,
                p.nombre AS producto_nombre,
                p.precio AS producto_precio,
                c.cantidad,
                (p.precio * c.cantidad) AS total,
                c.fecha_compra
            FROM compras c
            INNER JOIN usuarios u ON c.usuario_id = u.id
            INNER JOIN productos p ON c.producto_id = p.id
            WHERE c.id = ?
        `, [id]);

        if (compras.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Compra con ID ${id} no encontrada`
            });
        }

        res.json({ status: 'success', data: compras[0] });

    } catch (error) {
        console.error('Error al obtener compra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// GET /api/compras/usuario/:usuario_id — Compras de un usuario
// ============================================================
// Endpoint útil para ver el historial de compras de un usuario.
// Demuestra cómo filtrar datos relacionados.
router.get('/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        // Verificar que el usuario existe
        const [usuario] = await db.execute(
            'SELECT id, nombre, email FROM usuarios WHERE id = ?',
            [usuario_id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Usuario con ID ${usuario_id} no encontrado`
            });
        }

        // Obtener las compras del usuario
        const [compras] = await db.execute(`
            SELECT
                c.id,
                p.nombre AS producto,
                p.precio,
                c.cantidad,
                (p.precio * c.cantidad) AS total,
                c.fecha_compra
            FROM compras c
            INNER JOIN productos p ON c.producto_id = p.id
            WHERE c.usuario_id = ?
            ORDER BY c.fecha_compra DESC
        `, [usuario_id]);

        // Calcular el total gastado por el usuario
        // reduce() recorre el array y acumula un valor
        const totalGastado = compras.reduce((sum, c) => sum + parseFloat(c.total), 0);

        res.json({
            status: 'success',
            data: {
                usuario: usuario[0],
                compras: compras,
                total_compras: compras.length,
                total_gastado: totalGastado.toFixed(2)
            }
        });

    } catch (error) {
        console.error('Error al obtener compras del usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// POST /api/compras — Registrar nueva compra
// ============================================================
// Antes de insertar, verificamos que tanto el usuario como el
// producto existan. Aunque la FK lo haría por nosotros, es mejor
// dar mensajes de error claros al cliente.
router.post('/', async (req, res) => {
    try {
        const errores = validarCompra(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { usuario_id, producto_id, cantidad = 1 } = req.body;

        // Verificar que el usuario existe
        const [usuario] = await db.execute(
            'SELECT id, nombre FROM usuarios WHERE id = ?', [usuario_id]
        );
        if (usuario.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Usuario con ID ${usuario_id} no encontrado`
            });
        }

        // Verificar que el producto existe
        const [producto] = await db.execute(
            'SELECT id, nombre, precio FROM productos WHERE id = ?', [producto_id]
        );
        if (producto.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${producto_id} no encontrado`
            });
        }

        // Insertar la compra
        const [resultado] = await db.execute(
            'INSERT INTO compras (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
            [usuario_id, producto_id, parseInt(cantidad)]
        );

        // Devolver la compra completa con datos del usuario y producto
        const total = (producto[0].precio * parseInt(cantidad)).toFixed(2);

        res.status(201).json({
            status: 'success',
            data: {
                id: resultado.insertId,
                usuario: usuario[0].nombre,
                producto: producto[0].nombre,
                precio_unitario: producto[0].precio,
                cantidad: parseInt(cantidad),
                total: parseFloat(total)
            }
        });

    } catch (error) {
        console.error('Error al crear compra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// DELETE /api/compras/:id — Eliminar una compra
// ============================================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [compra] = await db.execute(
            'SELECT id FROM compras WHERE id = ?', [id]
        );

        if (compra.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Compra con ID ${id} no encontrada`
            });
        }

        await db.execute('DELETE FROM compras WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: { mensaje: `Compra con ID ${id} eliminada` }
        });

    } catch (error) {
        console.error('Error al eliminar compra:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;