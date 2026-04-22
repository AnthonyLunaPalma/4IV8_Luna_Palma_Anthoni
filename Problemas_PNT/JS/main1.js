const boton1 = document.getElementById("boton1");
const display1 = document.getElementById("montoFinal");

boton1.addEventListener("click", () => {
    const monto = document.getElementById("input1").value;

    const resultado = Number(monto) * 1.02;

    display1.innerText = `El monto total es de $${resultado}`;
})