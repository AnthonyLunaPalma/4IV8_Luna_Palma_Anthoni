// ============================================================
// PRÁCTICA 3 - PNT: Rutas de Usuarios (Express Router)
// ============================================================
// NUEVO EN P3: Express Router
//
// Express permite organizar las rutas en "routers" separados.
// Cada router maneja las rutas de un recurso específico.
// Esto es mucho más organizado que tener todo en un solo archivo.
//
// ESTRUCTURA:
// /api/usuarios      → GET (listar), POST (crear)
// /api/usuarios/:id  → GET (uno), PUT (actualizar), DELETE (eliminar)
//
// DIFERENCIAS CON P1/P2:
// - No necesitamos parsear la URL manualmente (Express lo hace)
// - No necesitamos leer el body manualmente (express.json() lo hace)
// - No necesitamos manejar CORS manualmente (el middleware lo hace)
// - El código es más limpio y enfocado en la lógica de negocio
// ============================================================

// express.Router() crea un mini-aplicación con sus propias rutas
// Es como un "sub-servidor" dedicado a un recurso
const express = require('express');
const router = express.Router();

// Importar la conexión a la base de datos
const db = require('../DB/database');

// ============================================================
// FUNCIÓN: Validar datos de usuario
// ============================================================
function validarUsuario(datos) {
    const errores = [];

    if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim().length < 2) {
        errores.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
    }

    if (!datos.email || typeof datos.email !== 'string') {
        errores.push('El email es obligatorio');
    } else {
        // Validar formato de email con expresión regular básica
        // Esta regex verifica: texto@texto.texto
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datos.email)) {
            errores.push('El formato del email no es válido');
        }
    }

    return errores;
}

// ============================================================
// GET /api/usuarios — Listar todos los usuarios
// ============================================================
// En Express, definimos rutas con router.get(), router.post(), etc.
// El primer argumento es la ruta RELATIVA al prefijo del router.
// Como este router se monta en '/api/usuarios', la ruta '/'
// corresponde a '/api/usuarios'.
//
// (req, res) son los objetos de petición y respuesta de Express.
// Express los enriquece con métodos útiles como res.json().
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios ORDER BY id ASC'
        );

        // res.json() es un método de Express que:
        // 1. Establece Content-Type: application/json automáticamente
        // 2. Convierte el objeto a JSON con JSON.stringify()
        // 3. Envía la respuesta
        // Mucho más simple que nuestro enviarJSON() de P1/P2
        res.json({
            status: 'success',
            data: usuarios,
            count: usuarios.length
        });

    } catch (error) {
        console.error('Error al listar usuarios:', error.message);
        // res.status() establece el código HTTP
        // Es encadenable: res.status(500).json(...)
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// GET /api/usuarios/:id — Obtener un usuario por ID
// ============================================================
// :id es un "parámetro de ruta" de Express.
// Express extrae el valor y lo pone en req.params.id
// Ejemplo: GET /api/usuarios/3 → req.params.id = "3"
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [usuarios] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Usuario con ID ${id} no encontrado`
            });
        }

        res.json({ status: 'success', data: usuarios[0] });

    } catch (error) {
        console.error('Error al obtener usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// POST /api/usuarios — Crear nuevo usuario
// ============================================================
// req.body contiene los datos enviados en el cuerpo de la petición.
// Esto funciona automáticamente gracias al middleware express.json()
// que configuramos en server.js.
// En P1/P2 teníamos que leer el body manualmente con leerBody().
router.post('/', async (req, res) => {
    try {
        const errores = validarUsuario(req.body);
        if (errores.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: errores.join('; ')
            });
        }

        const { nombre, email } = req.body;

        const [resultado] = await db.execute(
            'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
            [nombre.trim(), email.trim().toLowerCase()]
        );

        const [nuevoUsuario] = await db.execute(
            'SELECT id, nombre, email, created_at FROM usuarios WHERE id = ?',
            [resultado.insertId]
        );

        // 201 = Created
        res.status(201).json({
            status: 'success',
            data: nuevoUsuario[0]
        });

    } catch (error) {
        // Manejar error de email duplicado (UNIQUE constraint)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un usuario con ese email'
            });
        }
        console.error('Error al crear usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// PUT /api/usuarios/:id — Actualizar usuario
// ============================================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existente] = await db.execute('SELECT id FROM usuarios WHERE id = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Usuario con ID ${id} no encontrado`
            });
        }

        const errores = validarUsuario(req.body);
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        const { nombre, email } = req.body;

        await db.execute(
            'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
            [nombre.trim(), email.trim().toLowerCase(), id]
        );

        const [actualizado] = await db.execute(
            'SELECT id, nombre, email, created_at, updated_at FROM usuarios WHERE id = ?',
            [id]
        );

        res.json({ status: 'success', data: actualizado[0] });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe otro usuario con ese email'
            });
        }
        console.error('Error al actualizar usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// ============================================================
// DELETE /api/usuarios/:id — Eliminar usuario
// ============================================================
// NOTA: Gracias a ON DELETE CASCADE en la tabla compras,
// al eliminar un usuario se eliminan automáticamente sus compras.
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [usuario] = await db.execute(
            'SELECT id, nombre FROM usuarios WHERE id = ?', [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Usuario con ID ${id} no encontrado`
            });
        }

        await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);

        res.json({
            status: 'success',
            data: {
                eliminado: usuario[0],
                mensaje: `Usuario "${usuario[0].nombre}" y sus compras eliminados`
            }
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// Exportar el router para que server.js lo pueda usar
module.exports = router;