const pool1 = require('../bd-local');

const COLUMNAS_PUBLICAS = 'id, nombre, correo, boleta, rol';

//Consultar a todos
async function listas(){
    const [filas] = await pool1.query(`
        SELECT ${COLUMNAS_PUBLICAS} FROM  usuarios ORDER BY id`)
        return filas;
}

//obtener por id
async function obtenerPorId(){
    const [filas] = await pool1.query(`
        SELECT ${COLUMNAS_PUBLICAS} FROM  usuarios WHERE id=?`)
        return filas[0];
}

//Registrar
async function crear({nombre, correo, contrasenaHash, boleta, rol}) {
    const [info] = await pool1.query(
        `INSERT INTO usuarios (nombre, correo, contrasena_hash, boleta, rol) VALUES (?, ?, ?, ?, ?)`, 
        [nombre, correo, contrasenaHash, boleta, rol || 'alumno']
    );
    return obtenerPorId(info.insertId);
    //insertId es el metodo para insertar en la base de datos
}

//La contrasena no se cambia con un id, hay que borrarla y volverla a insertar o habria un problema de seguridad
async function actualizar(id, {nombre, correo, rol}){
    const cambios = Object.entries({nombre, correo, rol}).filter
    (([, valor]) => valor !== undefined);
    if(cambios.length === 0)return obtenerPorId(id);

    const columnas = cambios.map(([columna]) => `${columna} = ?`).join(', ');

    const [info] = await pool1.query(`UPDATE usuarios SET ${columnas} WHERE id = ?`,
    [...cambios.map(([, valor]) => valor), id]);
    
    if(info.affectedRows === 0) return undefined;
    return obtenerPorId(id);

}

//eliminar

async function eliminar(id){
    const [filas] = await pool1.query(`
        DELETE ${COLUMNAS_PUBLICAS} FROM  usuarios WHERE id=?`)
        return info.affectedRows > 0;
}

//buscar por correo hasheado
async function buscarPorCorreoConHash(correo){
    const [filas] = await pool1.query('SELECT * FROM  usuarios WHERE correo=?', [correo])
        return filas[0];
}

module.exports = {listar, obtenerPorId, crear, actualizar, eliminar, buscarPorCorreoConHash};

//deberan de crear los modelos de las tablas talleres y asistencia
//taller tiene registraralumno al taller, consultar todos los talleres
//asistencia tiene registrarasistencia, consultar asistencia de taller
// Se llaman talleres y asistencia_modelo y ambas tienen 2 funcionalidades