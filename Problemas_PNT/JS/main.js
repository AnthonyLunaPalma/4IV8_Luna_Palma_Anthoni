const boton1 = document.getElementById("boton1");
const display1 = document.getElementById("montoFinal");
const boton2 = document.getElementById("boton2");
const display2 = document.getElementById("sueldoFinal");
const boton3 = document.getElementById("boton3");
const display3 = document.getElementById("precioFinal");
const boton4 = document.getElementById("boton4");
const display4 = document.getElementById("promedioFinal");
const boton5 = document.getElementById("boton5");
const display5 = document.getElementById("porcentajeFinal");
const añoActual = new Date().getFullYear();
const boton6 = document.getElementById("boton6");
const display6 = document.getElementById("edad");

boton1.addEventListener("click", () => {
    const monto = document.getElementById("input1").value;

    const resultado = Number(monto) * 1.02;

    display1.innerText = `El monto total es de $${resultado}`;
})

boton2.addEventListener("click", () => {
    const sueldo = document.getElementById("input2").value;

    const resultadoCom = Number(sueldo) * 0.30;
    const resultadoSueldo = Number(sueldo) + resultadoCom;

    display2.innerText = `El sueldo extra es de $${resultadoCom}, el sueldo total es de $${resultadoSueldo}`;
})

boton3.addEventListener("click", () => {
    const precio = document.getElementById("input3").value;

    const resultado3 = Number(precio) - (Number(precio) * 0.15);

    display3.innerText = `El precio final es de $${resultado3}`;
})

boton4.addEventListener("click", () => {
    const promedio = document.getElementById("input41").value;
    const examen = document.getElementById("input42").value;
    const trabajoFinal = document.getElementById("input43").value;

    const resultadoPromedio = ((Number(promedio) * 5.5) / 10) + ((Number(examen) * 3.0) / 10) + ((Number(trabajoFinal) * 1.5) / 10);

    display4.innerText = `El promedio final es de ${resultadoPromedio}`;
})

boton5.addEventListener("click", () => {
    const nmujeres = document.getElementById("input52").value;
    const nhombres = document.getElementById("input51").value;

    const resultadoSuma = Number(nmujeres) + Number(nhombres);

    const resultado1 = (Number(nhombres) * 100) / resultadoSuma;
    const resultado2 = (Number(nmujeres) * 100) / resultadoSuma;

    display5.innerText = `Los porcentajes son H: ${resultado1}% y M: ${resultado2}%`;
})

boton6.addEventListener("click", () => {
    const nacimiento = document.getElementById("input6").value;

    const resultadoEdad = 2026 - Number(nacimiento);

    display6.innerText = `Usted tene ${resultadoEdad} años`;
})