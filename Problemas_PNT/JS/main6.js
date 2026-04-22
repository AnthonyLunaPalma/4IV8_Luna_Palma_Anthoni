const añoActual = new Date().getFullYear();
const boton6 = document.getElementById("boton6");
const display6 = document.getElementById("edad");

boton6.addEventListener("click", () => {
    const nacimiento = document.getElementById("input6").value;

    const resultadoEdad = 2026 - Number(nacimiento);

    display6.innerText = `Usted tene ${resultadoEdad} años`;
})