var instrucciones = [
    "Utiliza las flechas de navegacion para mover las piezas",
    "Para ordenar las piezas guiate por la imagen objetivo"
];

//Para guardar los movimientos necesitamos un areglo

var movimientos = [];

//Tengo quer saber cuales son las posiciones del rompecabezas original

var rompe = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

//Necesito otra variable para saber que el orden del rompecabezas es el correcto

var rompeCorrecta = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

//Necesito conocer la posicion de la ficha o piexza vaioa

var filaVacia = 2;
var columnaVacia = 2;

//Necesito una funcion que se encarge de mostrar la lista de instrucciones.

function mostrarInstrucciones(instrucciones){
    for(var i = 0; i < instrucciones.length; i++){
        mostrarInstruccionesLista(instrucciones[i], "lista-instrucciones");
    }
}

function mostrarInstruccionesLista(instruccion, idlista){
    var ul = document.getElementById(idlista);
    var li = document.createElementNS("li");
    li.textContent = instruccion;
    ul.appendChild(li);
}