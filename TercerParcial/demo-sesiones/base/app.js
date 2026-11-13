// La aplicación de la demo. server.js la arranca; las pruebas la arrancan con otras configuraciones.
// Lo que dice "(en clase)" lo programamos juntos, paso por paso. Mientras no esté, esa ruta responde 501.
const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { crearModeloUsuarios } = require('./modelos/usuarios.modelo');

const NOMBRE_COOKIE = 'connect.sid';

// Regresa todas las sesiones del almacén (MemoryStore usa callback; MySQLStore regresa una promesa).
function todasLasSesiones(almacen) {
  return new Promise((resolve, reject) => {
    const promesa = almacen.all((error, sesiones) => (error ? reject(error) : resolve(sesiones)));
    if (promesa && typeof promesa.then === 'function') promesa.then(resolve, reject);
  });
}

// Respuesta para lo que todavía no programamos.
const pendiente = (paso) => (req, res) =>
  res.status(501).json({ error: `501 · Falta programarlo en clase (paso ${paso})` });

// pool: la conexión a MySQL (db.js). Los usuarios SIEMPRE se leen de MySQL.
function crearApp(config, pool) {
  const app = express();
  app.use(express.json());
  const usuarios = crearModeloUsuarios(pool);

  // Aquí vive lo que el servidor recuerda de cada sesión:
  //  - 'mysql':   en la tabla sessions. Sobrevive a un reinicio y la puedes ver en Workbench.
  //  - 'memoria': en la memoria del proceso. Si el servidor se reinicia, se pierde todo.
  const almacen = config.almacen === 'memoria' ? new session.MemoryStore() : new MySQLStore({ createDatabaseTable: false, clearExpired: false }, pool);
  app.locals.almacen = almacen;

  
}
app.use(
    session({
      name: NOMBRE_COOKIE,
      secret: process.env.SESSION_SECRET || 'secreto-solo.para-la-demo',
      store: almacen,
      resave: false,
      //no se crea la sesion ni la cookie
      saveUninitialized: false,
      rolling: config.rolling || false,
      cookie: {
        maxAge: configAge || 1000*60*60*24,
        httpOnly: config.httpOnly || true,
        sameSite: config.sameSite || 'lax',
        secure: config.secure || false, //Cuando lo subamos a un servidor hay que cambiarlo a true
      }
    })
  );
  //Necesitamos visualizar el id de la sesion para compararla en la pantalla
const idCorto = (id) => (id ? `${id.slice(0, 8)}...` : null);
module.exports = { crearApp, NOMBRE_COOKIE };

//Nosotros estamos


function vencida(sesion){
  const desde = config.rolling ? sesion.ultimoUso : sesion.creada;
  return Date.now() - desde > config.maxAge;
}

//madar un 401 no se quien eres
function requireSesion(req, res, next){
  if(req.session.usuario && vencida(req.session)){
    return req.session.destroy(()=>{
      res.clearCookkie(NOMBRE_COOKIE);
      res.status(401).json({error: '401 Tu sesion ya expiro, vuelve a iniciar sesion'});
    });
  }
  if(!req.session.usuario){
    return res.status(401).json({error: '401 No has iniciado sesion con la cuenta correcta.'})
  }
  req.session.ultimoUso = Date.now();
  next();
}
function requiereRol(rol){
  return (req, res, next)=>{
    if(req.session.usuario.rol !== rol){
      return res.status(403).json({error: `eres ${res.session.usuario.usuario}, pero esta ruta es para ${rol}`});
    }
    next();
  }

  //vamos a definir las rutas de acceso
  app.get('/api/cpnfig', (req, res)=>{
    res.json(config);
  })

  //vamos a crear una ruta para un usuario visitante sin que inicie sesion

  app.post('/api/visita', (req, res) =>{
    if(!req.session) return res.json({error: 'no tiene acceso'});
    req.session.visitas = (req.session.visitas || 0) + 1;
    res.json({visitas: req.session.visitas, session: idCorto(req.sessionID)})
  })

  //Vamos a autenticarnos

}