const boton2 = document.getElementById("boton2");
const display2 = document.getElementById("sueldoFinal");

boton2.addEventListener("click", () => {
    const sueldo = document.getElementById("input2").value;

    const resultadoCom = Number(sueldo) * 0.30;
    const resultadoSueldo = Number(sueldo) + resultadoCom;

    display2.innerText = `El sueldo extra es de $${resultadoCom}, el sueldo total es de $${resultadoSueldo}`;
})