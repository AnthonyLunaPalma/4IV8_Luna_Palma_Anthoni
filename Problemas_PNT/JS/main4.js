const boton4 = document.getElementById("boton4");
const display4 = document.getElementById("promedioFinal");

boton4.addEventListener("click", () => {
    const promedio = document.getElementById("input41").value;
    const examen = document.getElementById("input42").value;
    const trabajoFinal = document.getElementById("input43").value;

    const resultadoPromedio = ((Number(promedio) * 5.5) / 10) + ((Number(examen) * 3.0) / 10) + ((Number(trabajoFinal) * 1.5) / 10);

    display4.innerText = `El promedio final es de ${resultadoPromedio}`;
})