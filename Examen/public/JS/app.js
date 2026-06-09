// ============================================================
// PRÁCTICA 3 - PNT: Frontend para Sistema de Compras
// ============================================================
// Este frontend maneja 3 secciones: Usuarios, Productos, Compras.
// Cada sección tiene su propio formulario y tabla.
//
// ESTRUCTURA DEL CÓDIGO:
// 1. Utilidades compartidas (fetchAPI, notificaciones, etc.)
// 2. Módulo de Usuarios (CRUD)
// 3. Módulo de Productos (CRUD)
// 4. Módulo de Compras (crear, listar, eliminar)
// 5. Navegación por pestañas
// 6. Inicialización
//
// EVOLUCIÓN DESDE P2:
// - Múltiples recursos (no solo usuarios)
// - Selects dinámicos (llenar opciones desde la API)
// - Navegación por pestañas sin recargar página (SPA-like)
// ============================================================

// ============================================================
// 1. UTILIDADES COMPARTIDAS
// ============================================================

// Panel de estado de la API
const apiMetodo = document.getElementById('api-metodo');
const apiUrl = document.getElementById('api-url');
const apiCodigo = document.getElementById('api-codigo');
const notificacionDiv = document.getElementById('notificacion');

// Fetch wrapper con logging (evolución de P2)
async function fetchAPI(url, opciones = {}) {
    const method = opciones.method || 'GET';

    apiMetodo.textContent = method;
    apiMetodo.className = `badge badge-${method.toLowerCase()}`;
    apiUrl.textContent = url;
    apiCodigo.textContent = '...';
    apiCodigo.className = 'badge badge-neutral';

    try {
        const respuesta = await fetch(url, opciones);
        apiCodigo.textContent = `${respuesta.status}`;
        apiCodigo.className = `badge ${respuesta.ok ? 'badge-success' : 'badge-error'}`;

        const datos = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(datos.message || `Error ${respuesta.status}`);
        }
        return datos;
    } catch (error) {
        if (apiCodigo.textContent === '...') {
            apiCodigo.textContent = 'ERROR';
            apiCodigo.className = 'badge badge-error';
        }
        throw error;
    }
}

function mostrarNotificacion(mensaje, tipo) {
    notificacionDiv.textContent = mensaje;
    notificacionDiv.className = `notificacion ${tipo}`;
    notificacionDiv.style.display = 'block';
    setTimeout(() => { notificacionDiv.style.display = 'none'; }, 3000);
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function formatearFechaHora(fechaISO) {
    if (!fechaISO) return '-';
    return new Date(fechaISO).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// ============================================================
// 2. MÓDULO DE USUARIOS
// ============================================================

const formUsuario = document.getElementById('form-usuario');
const inputUsuarioId = document.getElementById('usuario-id');
const inputUsuarioNombre = document.getElementById('usuario-nombre');
const inputUsuarioEmail = document.getElementById('usuario-email');
const formTituloUsuario = document.getElementById('form-titulo-usuario');
const btnGuardarUsuario = document.getElementById('btn-guardar-usuario');
const btnCancelarUsuario = document.getElementById('btn-cancelar-usuario');
const tbodyUsuarios = document.getElementById('tbody-usuarios');
const tablaUsuarios = document.getElementById('tabla-usuarios');
const cargaUsuarios = document.getElementById('carga-usuarios');
const contadorUsuarios = document.getElementById('contador-usuarios');
const errorUsuarioNombre = document.getElementById('error-usuario-nombre');
const errorUsuarioEmail = document.getElementById('error-usuario-email');

async function cargarUsuarios() {
    try {
        const resp = await fetchAPI('/api/usuarios');
        cargaUsuarios.style.display = 'none';

        if (resp.data.length === 0) {
            tablaUsuarios.style.display = 'none';
            cargaUsuarios.textContent = 'No hay usuarios registrados.';
            cargaUsuarios.style.display = 'block';
        } else {
            tablaUsuarios.style.display = 'table';
            tbodyUsuarios.innerHTML = '';
            resp.data.forEach(u => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${u.id}</td>
                    <td>${escapeHtml(u.nombre)}</td>
                    <td>${escapeHtml(u.email)}</td>
                    <td>
                        <button class="btn-ver" onclick="verComprasUsuario(${u.id})">Compras</button>
                        <button class="btn-editar" onclick="editarUsuario(${u.id})">Editar</button>
                        <button class="btn-eliminar" onclick="confirmarEliminarUsuario(${u.id}, '${escapeHtml(u.nombre)}')">Eliminar</button>
                    </td>
                `;
                tbodyUsuarios.appendChild(fila);
            });
        }
        contadorUsuarios.textContent = `${resp.count}`;
    } catch (error) {
        mostrarNotificacion('Error al cargar usuarios: ' + error.message, 'error');
    }
}

function validarFormUsuario() {
    let ok = true;
    const nombre = inputUsuarioNombre.value.trim();
    const email = inputUsuarioEmail.value.trim();

    if (!nombre || nombre.length < 2) {
        errorUsuarioNombre.textContent = 'Mínimo 2 caracteres';
        inputUsuarioNombre.classList.add('input-error');
        ok = false;
    } else {
        errorUsuarioNombre.textContent = '';
        inputUsuarioNombre.classList.remove('input-error');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorUsuarioEmail.textContent = 'Email no válido';
        inputUsuarioEmail.classList.add('input-error');
        ok = false;
    } else {
        errorUsuarioEmail.textContent = '';
        inputUsuarioEmail.classList.remove('input-error');
    }

    return ok;
}

function limpiarFormUsuario() {
    formUsuario.reset();
    inputUsuarioId.value = '';
    formTituloUsuario.textContent = 'Agregar Usuario';
    btnGuardarUsuario.textContent = 'Guardar';
    btnCancelarUsuario.style.display = 'none';
    errorUsuarioNombre.textContent = '';
    errorUsuarioEmail.textContent = '';
    inputUsuarioNombre.classList.remove('input-error');
    inputUsuarioEmail.classList.remove('input-error');
}

formUsuario.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormUsuario()) return;

    const datos = {
        nombre: inputUsuarioNombre.value.trim(),
        email: inputUsuarioEmail.value.trim()
    };
    const id = inputUsuarioId.value;

    try {
        if (id) {
            await fetchAPI(`/api/usuarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            mostrarNotificacion('Usuario actualizado', 'exito');
        } else {
            await fetchAPI('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            mostrarNotificacion('Usuario creado', 'exito');
        }
        limpiarFormUsuario();
        cargarUsuarios();
        cargarSelectUsuarios(); // Actualizar select de compras
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
});

async function editarUsuario(id) {
    try {
        const resp = await fetchAPI(`/api/usuarios/${id}`);
        inputUsuarioId.value = resp.data.id;
        inputUsuarioNombre.value = resp.data.nombre;
        inputUsuarioEmail.value = resp.data.email;
        formTituloUsuario.textContent = 'Editar Usuario';
        btnGuardarUsuario.textContent = 'Actualizar';
        btnCancelarUsuario.style.display = 'inline-block';
        cambiarSeccion('usuarios');
        formUsuario.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

function confirmarEliminarUsuario(id, nombre) {
    if (confirm(`¿Eliminar a "${nombre}" y todas sus compras?`)) {
        eliminarUsuario(id);
    }
}

async function eliminarUsuario(id) {
    try {
        await fetchAPI(`/api/usuarios/${id}`, { method: 'DELETE' });
        mostrarNotificacion('Usuario eliminado', 'exito');
        if (inputUsuarioId.value === String(id)) limpiarFormUsuario();
        cargarUsuarios();
        cargarSelectUsuarios();
        cargarCompras();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

// Ver compras de un usuario específico
async function verComprasUsuario(id) {
    try {
        const resp = await fetchAPI(`/api/compras/usuario/${id}`);
        const { usuario, compras, total_compras, total_gastado } = resp.data;

        let mensaje = `${usuario.nombre} tiene ${total_compras} compra(s).\nTotal gastado: $${total_gastado}\n\n`;
        compras.forEach(c => {
            mensaje += `- ${c.producto} x${c.cantidad} = $${parseFloat(c.total).toFixed(2)}\n`;
        });

        alert(mensaje);
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

btnCancelarUsuario.addEventListener('click', limpiarFormUsuario);

// ============================================================
// 3. MÓDULO DE GUITARRAS
// ============================================================

const formGuitarra = document.getElementById('form-guitarra');
const inputGuitarraId = document.getElementById('guitarra-id');
const inputGuitarraNombre = document.getElementById('guitarra-nombre');
const inputGuitarraPrecio = document.getElementById('guitarra-precio');
const formTituloGuitarra = document.getElementById('form-titulo-guitarra');
const btnGuardarGuitarra = document.getElementById('btn-guardar-guitarra');
const btnCancelarGuitarra = document.getElementById('btn-cancelar-guitarra');
const tbodyGuitarras = document.getElementById('tbody-guitarras');
const tablaGuitarras = document.getElementById('tabla-guitarras');
const cargaGuitarras = document.getElementById('carga-guitarras');
const contadorGuitarras = document.getElementById('contador-guitarras');
const errorGuitarraNombre = document.getElementById('error-guitarra-nombre');
const errorGuitarraPrecio = document.getElementById('error-guitarra-precio');

async function cargarGuitarras() {
    try {
        const resp = await fetchAPI('/api/guitarras');
        cargaGuitarras.style.display = 'none';

        if (resp.data.length === 0) {
            tablaGuitarras.style.display = 'none';
            cargaGuitarras.textContent = 'No hay guitarras registradas.';
            cargaGuitarras.style.display = 'block';
        } else {
            tablaGuitarras.style.display = 'table';
            tbodyGuitarras.innerHTML = '';
            resp.data.forEach(g => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${g.id}</td>
                    <td>${escapeHtml(g.nombre)}</td>
                    <td>$${parseFloat(g.precio).toFixed(2)}</td>
                    <td>
                        <button class="btn-editar" onclick="editarGuitarra(${g.id})">Editar</button>
                        <button class="btn-eliminar" onclick="confirmarEliminarGuitarra(${g.id}, '${escapeHtml(g.nombre)}')">Eliminar</button>
                    </td>
                `;
                tbodyGuitarras.appendChild(fila);
            });
        }
        contadorGuitarras.textContent = `${resp.count}`;
    } catch (error) {
        mostrarNotificacion('Error al cargar guitarras: ' + error.message, 'error');
    }
}

function validarFormGuitarra() {
    let ok = true;
    const nombre = inputGuitarraNombre.value.trim();
    const precio = inputGuitarraPrecio.value;

    if (!nombre || nombre.length < 2) {
        errorGuitarraNombre.textContent = 'Mínimo 2 caracteres';
        inputGuitarraNombre.classList.add('input-error');
        ok = false;
    } else {
        errorGuitarraNombre.textContent = '';
        inputGuitarraNombre.classList.remove('input-error');
    }

    if (!precio || parseFloat(precio) <= 0) {
        errorGuitarraPrecio.textContent = 'Precio debe ser mayor que 0';
        inputGuitarraPrecio.classList.add('input-error');
        ok = false;
    } else {
        errorGuitarraPrecio.textContent = '';
        inputGuitarraPrecio.classList.remove('input-error');
    }

    return ok;
}

function limpiarFormGuitarra() {
    formGuitarra.reset();
    inputGuitarraId.value = '';
    formTituloGuitarra.textContent = 'Agregar Guitarra';
    btnGuardarGuitarra.textContent = 'Guardar';
    btnCancelarGuitarra.style.display = 'none';
    errorGuitarraNombre.textContent = '';
    errorGuitarraPrecio.textContent = '';
    inputGuitarraNombre.classList.remove('input-error');
    inputGuitarraPrecio.classList.remove('input-error');
}

formGuitarra.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormGuitarra()) return;

    const datos = {
        nombre: inputGuitarraNombre.value.trim(),
        precio: parseFloat(inputGuitarraPrecio.value)
    };
    const id = inputGuitarraId.value;

    try {
        if (id) {
            await fetchAPI(`/api/guitarras/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            mostrarNotificacion('Guitarra actualizada', 'exito');
        } else {
            await fetchAPI('/api/guitarras', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            mostrarNotificacion('Guitarra creada', 'exito');
        }
        limpiarFormGuitarra();
        cargarGuitarras();
        cargarSelectGuitarras();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
});

async function editarGuitarra(id) {
    try {
        const resp = await fetchAPI(`/api/guitarras/${id}`);
        inputGuitarraId.value = resp.data.id;
        inputGuitarraNombre.value = resp.data.nombre;
        inputGuitarraPrecio.value = resp.data.precio;
        formTituloGuitarra.textContent = 'Editar Guitarra';
        btnGuardarGuitarra.textContent = 'Actualizar';
        btnCancelarGuitarra.style.display = 'inline-block';
        cambiarSeccion('guitarras');
        formGuitarra.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

function confirmarEliminarGuitarra(id, nombre) {
    if (confirm(`¿Eliminar "${nombre}"?\nSi tiene compras asociadas, no se podrá eliminar.`)) {
        eliminarGuitarra(id);
    }
}

async function eliminarGuitarra(id) {
    try {
        await fetchAPI(`/api/guitarras/${id}`, { method: 'DELETE' });
        mostrarNotificacion('Guitarra eliminada', 'exito');
        if (inputGuitarraId.value === String(id)) limpiarFormGuitarra();
        cargarGuitarras();
        cargarSelectGuitarras();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

btnCancelarGuitarra.addEventListener('click', limpiarFormGuitarra);

// ============================================================
// 4. MÓDULO DE COMPRAS
// ============================================================

const formCompra = document.getElementById('form-compra');
const selectUsuario = document.getElementById('compra-usuario');
const selectGuitarra = document.getElementById('compra-guitarra');
const inputCantidad = document.getElementById('compra-cantidad');
const tbodyCompras = document.getElementById('tbody-compras');
const tablaCompras = document.getElementById('tabla-compras');
const cargaCompras = document.getElementById('carga-compras');
const contadorCompras = document.getElementById('contador-compras');
const errorCompraUsuario = document.getElementById('error-compra-usuario');
const errorCompraGuitarra = document.getElementById('error-compra-guitarra');
const errorCompraCantidad = document.getElementById('error-compra-cantidad');

// Llenar el <select> de usuarios con datos de la API
// Los <select> se llenan dinámicamente cada vez que cambian
// los datos, para mantenerlos sincronizados con la BD.
async function cargarSelectUsuarios() {
    try {
        const resp = await fetchAPI('/api/usuarios');
        selectUsuario.innerHTML = '<option value="">-- Seleccionar usuario --</option>';
        resp.data.forEach(u => {
            // createElement es más seguro que innerHTML para datos dinámicos
            const option = document.createElement('option');
            option.value = u.id;
            option.textContent = `${u.nombre} (${u.email})`;
            selectUsuario.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando select usuarios:', error);
    }
}

async function cargarSelectGuitarras() {
    try {
        const resp = await fetchAPI('/api/guitarras');
        selectGuitarra.innerHTML = '<option value="">-- Seleccionar guitarra --</option>';
        resp.data.forEach(g => {
            const option = document.createElement('option');
            option.value = g.id;
            option.textContent = `${g.nombre} — $${parseFloat(g.precio).toFixed(2)}`;
            selectGuitarra.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando select guitarras:', error);
    }
}

async function cargarCompras() {
    try {
        const resp = await fetchAPI('/api/compras');
        cargaCompras.style.display = 'none';

        if (resp.data.length === 0) {
            tablaCompras.style.display = 'none';
            cargaCompras.textContent = 'No hay compras registradas.';
            cargaCompras.style.display = 'block';
        } else {
            tablaCompras.style.display = 'table';
            tbodyCompras.innerHTML = '';
            resp.data.forEach(c => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${c.id}</td>
                    <td>${escapeHtml(c.usuario_nombre)}</td>
                    <td>${escapeHtml(c.guitarra_nombre)}</td>
                    <td>$${parseFloat(c.guitarra_precio).toFixed(2)}</td>
                    <td>${c.cantidad}</td>
                    <td><strong>$${parseFloat(c.total).toFixed(2)}</strong></td>
                    <td>${formatearFechaHora(c.fecha_compra)}</td>
                    <td>
                        <button class="btn-eliminar" onclick="confirmarEliminarCompra(${c.id})">Eliminar</button>
                    </td>
                `;
                tbodyCompras.appendChild(fila);
            });
        }
        contadorCompras.textContent = `${resp.count}`;
    } catch (error) {
        mostrarNotificacion('Error al cargar compras: ' + error.message, 'error');
    }
}

function validarFormCompra() {
    let ok = true;

    if (!selectUsuario.value) {
        errorCompraUsuario.textContent = 'Selecciona un usuario';
        selectUsuario.classList.add('input-error');
        ok = false;
    } else {
        errorCompraUsuario.textContent = '';
        selectUsuario.classList.remove('input-error');
    }

    if (!selectGuitarra.value) {
        errorCompraGuitarra.textContent = 'Selecciona una guitarra';
        selectGuitarra.classList.add('input-error');
        ok = false;
    } else {
        errorCompraGuitarra.textContent = '';
        selectGuitarra.classList.remove('input-error');
    }

    const cant = parseInt(inputCantidad.value);
    if (!cant || cant < 1) {
        errorCompraCantidad.textContent = 'Mínimo 1';
        inputCantidad.classList.add('input-error');
        ok = false;
    } else {
        errorCompraCantidad.textContent = '';
        inputCantidad.classList.remove('input-error');
    }

    return ok;
}

formCompra.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormCompra()) return;

    try {
        const resp = await fetchAPI('/api/compras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: parseInt(selectUsuario.value),
                guitarra_id: parseInt(selectGuitarra.value),
                cantidad: parseInt(inputCantidad.value)
            })
        });

        mostrarNotificacion(
            `Compra registrada: ${resp.data.usuario} compró ${resp.data.cantidad}x ${resp.data.guitarra} ($${resp.data.total})`,
            'exito'
        );
        formCompra.reset();
        inputCantidad.value = '1';
        cargarCompras();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
});

function confirmarEliminarCompra(id) {
    if (confirm('¿Eliminar esta compra?')) {
        eliminarCompra(id);
    }
}

async function eliminarCompra(id) {
    try {
        await fetchAPI(`/api/compras/${id}`, { method: 'DELETE' });
        mostrarNotificacion('Compra eliminada', 'exito');
        cargarCompras();
    } catch (error) {
        mostrarNotificacion(error.message, 'error');
    }
}

// ============================================================
// 5. NAVEGACIÓN POR PESTAÑAS
// ============================================================
// Esta función muestra una sección y oculta las demás.
// También actualiza la pestaña activa visualmente.
// Es un patrón básico de SPA (Single Page Application):
// cambiar contenido sin recargar la página.
function cambiarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(s => {
        s.style.display = 'none';
    });

    // Desactivar todas las pestañas
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    document.getElementById(`seccion-${seccion}`).style.display = 'block';

    // Activar la pestaña correspondiente
    // Array.from convierte NodeList a Array para poder usar find()
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const tabActiva = tabs.find(t => t.textContent.toLowerCase() === seccion);
    if (tabActiva) tabActiva.classList.add('active');

    // Si cambiamos a compras, recargar selects con datos actuales
    if (seccion === 'compras') {
        cargarSelectUsuarios();
        cargarSelectGuitarras();
        cargarCompras();
    }
}

// ============================================================
// 5. NAVEGACIÓN POR PESTAÑAS
// ============================================================
// Esta función muestra una sección y oculta las demás.
// También actualiza la pestaña activa visualmente.
// Es un patrón básico de SPA (Single Page Application):
// cambiar contenido sin recargar la página.
function cambiarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(s => {
        s.style.display = 'none';
    });

    // Desactivar todas las pestañas
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    document.getElementById(`seccion-${seccion}`).style.display = 'block';

    // Activar la pestaña correspondiente
    // Array.from convierte NodeList a Array para poder usar find()
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const tabActiva = tabs.find(t => t.textContent.toLowerCase() === seccion);
    if (tabActiva) tabActiva.classList.add('active');

    // Si cambiamos a compras, recargar selects con datos actuales
    if (seccion === 'compras') {
        cargarSelectUsuarios();
        cargarSelectGuitarras();
        cargarCompras();
    }
}

// ============================================================
// 6. INICIALIZACIÓN
// ============================================================
// Al cargar la página, cargamos todos los datos iniciales.
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarGuitarras();
    cargarCompras();
    cargarSelectUsuarios();
    cargarSelectGuitarras();
});