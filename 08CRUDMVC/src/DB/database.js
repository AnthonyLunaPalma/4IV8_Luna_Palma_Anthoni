const mysql = require('mysql2');

//creamos la conexion

const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : 'S!caRu19301302',
    database : 'practicacrud',
    waitForConnections : true,
    connectionLimit : 10,
    queueLimit : 0
});

//la exportamos para poder usuarla
module.exports = pool.promise();