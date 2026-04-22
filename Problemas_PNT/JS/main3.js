const boton3 = document.getElementById("boton3");
const display3 = document.getElementById("precioFinal");

boton3.addEventListener("click", () => {
    const precio = document.getElementById("input3").value;

    const resultado3 = Number(precio) - (Number(precio) * 0.15);

    display3.innerText = `El precio final es de $${resultado3}`;
})