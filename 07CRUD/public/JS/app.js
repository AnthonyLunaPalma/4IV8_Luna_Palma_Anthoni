const formulario = document.getElementById('form-usuario');
const inputId = document.getElementById('usuario-id');
const inputNombre = document.getElementById('nombre');
const inputFecha = document.getElementById('fecha-nacimiento');
const inputNota = document.getElementById('nota');
const formTitulo = document.getElementById('form-titulo');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const tbodyUsuarios = document.getElementById('tbody-usuarios');
const tablausUarios = document.getElementById('tabla-usuarios');
const mensajeCargar = document.getElementById('mensaje-cargar');
const mensajeVacio = document.getElementById('mensaje-vacio');
const notificacionDiv = document.getElementById('notificacion-div');

const errorNombre = document.getElementById('error-nombre');
const errorFecha = document.getElementById('error-fecha');
const errorNota = document.getElementById('error-nota');

const API_URL = '/api/usuario';

async function cargarUsuarios() {
    try{
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok){
            throw new Error('Error al cargar usuarios');
        }

        const usuarios = await respuesta.json();

        renderizartabla(usuarios);
    } catch (error){
        console.log('Error: ', error);
        mostrarNotificacion('Error al cargar los usuarios,', 'error');
    }
}