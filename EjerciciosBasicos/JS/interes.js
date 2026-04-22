function validarn(e){
    var teclado = (document.all)?e.KeyCode:e.which;
    if (teclado == 8) return true;
    //Creo mi expresion regular
    var patron = /[0-9\d .]/;

    var codigo = String.fromCharCode(teclado);
    return patron.test(codigo);
}

function interes(){
    var valor = document.getElementById("cantidadi").value;
    //10% anual
    var interes = parseFloat(valor);
    var subtotal = interes * 0.10;

    var total = subtotal + interes;

    document.getElementById('sueldoi').value = "$ " + total;
}

function borrar(){
    document.getElementById('sueldoi').value="";
    document.getElementById('cantidadi').value="";
}