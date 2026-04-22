const boton5 = document.getElementById("boton5");
const display5 = document.getElementById("porcentajeFinal");

boton5.addEventListener("click", () => {
    const nmujeres = document.getElementById("input52").value;
    const nhombres = document.getElementById("input51").value;

    const resultadoSuma = Number(nmujeres) + Number(nhombres);

    const resultado1 = (Number(nhombres) * 100) / resultadoSuma;
    const resultado2 = (Number(nmujeres) * 100) / resultadoSuma;

    display5.innerText = `Los porcentajes son H: ${resultado1}% y M: ${resultado2}%`;
})