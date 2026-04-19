const nombre = document.getElementById("name")
const edad = document.getElementById("age")
const email = document.getElementById("email")
const form = document.getElementById("form")
const parrafo = document.getElementById("warnings")

form.addEventListener("submit", e=>{
    e.preventDefault()
    let warnings = ""
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/
    let entrar =false;
    parrafo.innerHTML = ""
    if(nombre.value.length <2){
        warnings += `El nombre no es válido <br>`
        entrar = true
    }
    if(edad.value.length >3){
        warnings += `La edad no es válida <br>`
        entrar = true
    }
    if(!regexEmail.test(email.value)){
        warnings += `El Email no es válido <br>`
        entrar = true
    }
    if(entrar){
        parrafo.innerHTML = warnings
    }else{
        parrafo.innerHTML = "Enviado"
    }
})