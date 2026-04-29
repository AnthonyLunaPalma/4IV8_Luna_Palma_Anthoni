// vamos a proramar todo vajo el esquema en ES6.

/*Para javascriot y tenemos el concepto de variable var

var

Se sustituye por las nuevas variables que son 

let --> es una variable de tipo "protegida" ya qoe solo funciona dentro de un fragmento de codigo

const --> se es constante

if(true){
    const x = "x";
    console.log(x);
}

let x = "y";
console.log(x);


// para declarar en javascript una funcion hay una forma mas efectiva de devlrarar funciones a partir de una funcion flecha

//una funcin flecha en JS a diferencia de una funcion normal. no genera su propio contexto (this), necesita ser declarada antes de ser udada y n necesita un return.

//funcion cods(String hola) {this.hola = hola}

//vamos hcer unaa funcion que sume dos numeros

function sumarnumeros(n1, n2){
    return n1 + n2;
}

const sumarDosNumeros = (n1, n2) => n1 + n2;

console.lof(`la suma de la funcion es: (2, 3) ${sumarnumeros(2, 3)}`);

// para armar una funcion flecha ebemos de entendeer su estructora: 
//"cadena" (el tipo de variable, el nombre de la funcion y e los argumantos) => operacion

*/

const razaDePerros = [
    "Gran Danes",
    "Doverman",
    "Chihuahua",
    "Pastor Aleman",
    "Pitbull",
    "San Bernardo",
    "Xoloscuincle"
];

/*
for(let i = 0; i < razaDePerros.length; i++){
    console.log(razaDePerros[i]);
}

for(const raza of razaDePerros){
    console.log(raza);
}

for(const indice in razaDePerros){
    console.log(razaDePerros[indice])
}

//forEach
//Iterar sobre elementos de arreglo que devualven nada

razaDePerros.forEach(raza => console.log(raza));
/*
por ejenplo necesiamos una funcion que busque la raza Chihuahua y si no existe agregarla


//funciion map esta funcion itera sobre lo elementos del arreglo  y yregresa un arrelo distinto con el que podemos hacer lo que queramos sin necesidad de modificar el arregloo original

if(razaDePerros.find(raza => raza === "Chihuahua")) {
    console.log("La raza si se encontro y es Chihuahua");
    console.log(razaDePerros);
} else {
    razaDePerros.push("Chihuahua");
    console.log(razaDePerros);
}
*/