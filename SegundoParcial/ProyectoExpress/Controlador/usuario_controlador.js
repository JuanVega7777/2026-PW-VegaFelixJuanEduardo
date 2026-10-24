const bcrypt = require('bcryptjs');

const UsuariosModel = require('../Modelo/usuarios_modelo');

const {validarCorreo, validarBoleta, validarContrasena} = require('../validaciones');

function esDuplicado(error){
    return error.code == 'ER_DUP_ENTRY' || error.code === '23505';
}

async function listarUsuarios(req, res){
    try{
        const usuarios = await UsuariosModel.listar();
        res.json(usuarios);
    } catch {
        res.status(500).json({error: error.message});
    }
    
}

async function obtenerUsuario(req, res) {
    try{
        const usuario = await UsuariosModel.obtenerPorId(req.params.id);
        if(!usuario) return res.status(404).json({error : 'Usuario no encontrado'});
        res.json(usaurio);
    } catch (error){
        res.status(500).json({error: error.message});
    }
}

async function crearUsuario(req, res) {
    const{nombre, correo, contrasena, boleta, rol} = req.body;

    if(!nombre || !correo || !contrasena || !boleta){
        return res.status(400).json({error: 'Los campos nombre, correo, contrasena, boleta son obligatorios'})
    }
    if(!validarCorreo(correo)) return res.status(400).json({error: 'El correo no tien un formato valido'})

    if(!validarBoleta(boleta)) return res.status(400).json({error: 'La boleta debe tener 10 digitos'})

    if(!validarContrasena(contrasena)) return res.status(400).json({error: 'La contrasena debe tener al menos 8 caracteres'})

    try{
        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const usuario = await UsuariosModel.crear({nombre, correo, contrasenaHash, boleta, rol})
        res.status(201).json(usuario);
    } catch(error){
        if(esDuplicado(error)) return res.status(409).json({error: 'Ya existe un usuario con ese  correo o boleta registrado'});
        res.status(500).json({error: error.message});
    }
}

async function actualizarUsuario(req, res){
    const {nombre, correo, rol} = req.body;
    
    if(nombre === undefined && correo === undefined && rol === undefined){
        return res.status(400).json({error: 'Se debe de llenar al menos uno de lo scampos de nombre, correo o rol para actualizar los datos'})
    }
    if(correo !== undefined && !validarCorreo(correo)){
        return res.status(400).json({error: 'El correo no tiene un formato valido'})
    }
    //mandar a llamar la funcion de nombre
    try{
        const usuario = await UsuariosModel.actualizar(req.params.id, {nombreo, correo, rol})
        if(!usuario) return res.status(404).json({error: 'Usuario encontrado'});
        res.json(usuario);
    } catch(error){
        if(esDuplicado(error)) return res.status(400).json({error: 'Ya existe un usuario con ese correo'});
        res.status(500).json({error: error.message});
    }
}

async function eliminarUsuario(req, res){
    try{
        const eliminado = await UsuariosModel.eliminar(req.params.id);
        if(!eliminado) return res.status(404).json({error: 'No se encontor el usaurio'});
        res.status(204).send()
    } catch(error){
        res.status(500).json({error: error.message})
    }
}

//deberan realizar los controladores de asistencia y talleres con sus funciones correspondientes

module.exports = {listarUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, eliminarUsuario}