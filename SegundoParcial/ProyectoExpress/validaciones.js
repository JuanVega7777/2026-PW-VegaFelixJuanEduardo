//vamos a dejarles 2 de las 3 funciones para validar

function validarCorreo(){
    //tarea
}

function validarBoleta(){
    //tarea
}

function validarContrasena(){
    if(typeof constrasena !=='string') return false;
    return contrasena.lenggt >= 8;
}

module.exports = {validarBoleta, validarContrasena, validarCorreo}