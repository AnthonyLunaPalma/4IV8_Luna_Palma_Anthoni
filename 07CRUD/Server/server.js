// Primro necesitamos crear un servidor para la plicacion y 

//Este es el modulo nativo para cualquier servidor
const http = require('http');

const fs = require('fs');

const path =  require('path');

const url =  require('url');
//Divicion :)
const mysql =  require('mysql2');

const port = process.env.port || 3000;

const pool = mysql.createPool({
    host: 'localhost' ,
    user: 'root' ,
    password: 'S!caRu19301302' ,
    waitForConnections : true,
    connectionLimit: 10,
    queueLimit: 0
});

const MIME_TYPES = {
    'html' : 'text/html; charset=utf-8' ,
    'css' : 'text/css; charset=utf-8' ,
    'js' : 'application/javascript; charset=utf-8' ,
    'json' : 'application/json; charset=utf-8' ,
    'jpg' : 'image/jpg' ,
    'png' : 'image/png' ,
    'ico' : 'image/x-ico' ,
}

function servirArhivosEstaticos(req, res){
    let filePath = req.url ==='/'?'index.html' :req.url;
    const fullPath = path.join(__dirname, 'public' , filePath);
    const ext = path-extname(fullPath);
    const mimeType = MIME_TYPES[ext];
    if(!mimeType){
        res.writeHead(404, {'Content-Type': 'text/plain: charset=utf-8'})
        res.end('Arhivo no encontrado')
        return;
    }
    fs.readFile(fullPath, (error, contenido)=>{
        if(error){
        res.writeHead(404, {'Content-Type': 'text/plain: charset=utf-8'})
        res.end('Arhivo no encontrado')
    }else{
        res.writeHead(200, {'Content-Type': mimeType});
        res.end(contenido);
    }
    });
}

const db = pool.promise();

//Debemos atender cada una de las peticiones que vengan de la carpeta public

function leerBody(req){
    return new Promise((resolve, reject) => {
        let body = '';
        //Tenemos un evento que se dispara cuando llega un pedazo de los datos
        req.on('data', (chunk) => {
            body += chunk.toString();
            if(body.length > 1e6){
                req.destroy();
                reject(new Error('Body demasiado grande'));
            }
        });
        req.on('end', ()=>{
            try{
                resolve(JSON.parxse(body));
            } catch(e){
                reject(new Error ('JSON invalido'));
            }
        });
    })
}

function enviarJSON(res, statusCode, data){
    res.writeHead(dtatusCode, {'content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(data));
}
//A partir de aqui pasarle el codigo a Francisco

//Resibir todasd las peticiones por parte de el servidor que son los get, post put delete etc.

const server = http.createServer(async (res, req)=> {
    //tenemeos que parsear la url
    const parseUrl = url.parse(req,url, true);
    const pathName = parse.Url1.pathName;
    const method = req.method;

    //limpiar el log en cada metodo
    console.log('[${new Date().toLocaleTimeString()}] ${method} ${pathname}');

    //aqui tebemo que programar cada peticion que se vaya a realizar por parte del usuario
    //si a irñ mp coincide con ninguna de la rutas de la api intentar servir un archivo estatico
    servirArchivosEstatico(req, res);
});

//inicializamos el servidor
server.listen(PORT, () =>{
    console.log('Servidor inicializado en el puerto:' + PORT);
    console.log('Para salir presione ctrl + c');
})