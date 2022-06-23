//Requires
const dotenv = require("dotenv");
dotenv.config();
const path = require('path'); 
const { uploadFileS3WithPath,uploadFileS3 } = require('../utils/utils');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const { validationResult } = require('express-validator');
const { connectionReady, connectionLost } = require('./connection')
const dbSequelize = require('../config/database_sequelize.js');
const { generateImage, cleanNumber, checkEnvFile, createClient, isValidNumber } = require('./handle')
const { saveMedia } = require('./send')
const Excel = require('xlsx');
const sequelize = dbSequelize.sequelize;
const fs = require('fs');
//**SESSION WHATSAPP */
const SESSION_FILE_PATH = './session.json';
const client = new Client();
var sessionData;
//Imports
const general_services = require('../services/general.js'); 
const { type } = require("os");
let messageWhatssap = [];
let codQR;
let flags = false;
 
/**
 * Generamos un QRCODE para iniciar sesion
 */
const withOutSession = async (req, res, next) => {
  console.log('No tenemos session guardada');
  //client = new Client(createClient());
 
  client.on('qr', qr => generateImage(qr, () => {
    //console.log("el qr",qr )
    qrcode.generate(qr, { small: true });
    res.status(200).json(qr)

  }))
  client.on('ready',  (a) => {
    flags=true
 });
     
 
  client.on('message', async msg => {
    const { from, body, hasMedia } = msg;
    if (from === 'status@broadcast' ) {
      return
    }
        
    let objectMessage =[];
    if (hasMedia) {
      const media = await msg.downloadMedia();
      const resultsave= await saveMedia(media, from); 
      if(resultsave.status==200){
        objectMessage = { from: from, body: body, hasMedia: hasMedia,url:resultsave.data};
      }
    }
    else{
      objectMessage = { from: from, body: body, hasMedia: hasMedia,url:""};
    }
   
     
    message = body.toLowerCase();
    messageWhatssap = [];
    
   
    let search = await dbSequelize.message.findOne({ where: { clientNumber: objectMessage.from } });
   
    if (search) {
      if(objectMessage.body!="" || objectMessage.hasMedia  ){
      let dataConsult = search.dataValues.body; 
      let archivo=search.dataValues.multimediaContent?search.dataValues.multimediaContent:[];
      let description = dataConsult;  
       // archivo.push({ fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }), urls: objectMessage.url ,usuario:"cliente" });
        description.push({ fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }), mensaje: objectMessage.body?objectMessage.body:objectMessage.url, usuario:"cliente" });
       await dbSequelize.message.update({ body: description, status: 0 }, { where: { idMessage: search.idMessage } });
       } 
       
    }
    else {  
      if( objectMessage.hasMedia || objectMessage.body!="" ){ 
         let Users = await dbSequelize.user.findAll({ where: { Role_idRole: 2 }, order: [['count', 'ASC']] });
          let archivo=[];
          let description=[]
          description.push({ fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }), mensaje: objectMessage.body?objectMessage.body:objectMessage.url, usuario:"cliente" });
          //archivo.push({ fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }), urls: objectMessage.url,usuario:"cliente" });
          await dbSequelize.user.update({  count: Users[0].count+1 }, {  where: { idUser:Users[0].idUser, }  }); 
                     
          let dataSend={body:description,clientNumber:objectMessage.from,idUser:Users[0].idUser,status:0}
          await dbSequelize.message.create(dataSend) 

        }
      }
   
    const allChats = await client.getChats();
      const lastFiftyChats = allChats.splice(0,10);
      
      lastFiftyChats.forEach(async(element)=>{ 
        if(element.isGroup=='false'){
           const status=await dbSequelize.message.findOne({ where: { clientNumber: `${element.id.user}@c.us` } });
           if(!status){
                let description=[];
                description.push({ fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }), mensaje: "Vi esto en Facebook....", usuario:"cliente" });
                let Users = await dbSequelize.user.findAll({ where: { Role_idRole: 2 }, order: [['count', 'ASC']] });
                await dbSequelize.user.update({ count: Users[0].count + 1 }, { where: { idUser: Users[0].idUser, } });
                let dataSend = { body: description , clientNumber: `${element.id.user}@c.us`, idUser: Users[0].idUser, status: 0 }
                await dbSequelize.message.create(dataSend)
           }
          
        }
         
      })
  
  
  });
 
  

  if (codQR) { res.status(200).json(codQR) }
  client.on('auth_failure', (e) => { 
  });

  client.on('authenticated', (session) => {
    sessionData = session;
    if (sessionData) {
      fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
          console.log(`Ocurrio un error con el archivo: `, err);
        }
      });
    }
  });
  client.initialize();
}
const createUser = async (req, res, next) => {
  //Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: errors.errors[0].msg });
    return;
  }

  try {
    const result = await general_services.createUser(req);
    if (result.status === 200) {
      res.status(result.status).json(result.message);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    console.log('Error', e);
    res.status(500).json({
      message: 'Por favor, valida los datos ingresados e intenta nuevamente.',
    });
  }
};
const AllUser = async (req, res, next) => {
  try {
    let dataSend = []
    const result = await general_services.AllUser();
    if (result.status === 200) {
      result.data.forEach(element => {
        dataSend.push({ idUser: element.idUser, email: element.email, name: element.name, phoneNumber: element.phoneNumber, role: element.Rol.roleName, count: element.count });
      });
      res.status(result.status).json(dataSend);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    res.status(500).json('No es posible obtener la información en este momento.');
  }

};
const makeLogin = async (req, res, next) => {

  //Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: errors.errors[0].msg });
    return;
  }
  const { email, password } = req.body;
  console.log(email, password)
  var ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  if (email !== "" && password !== "") {
    try {
      const result = await general_services.login(email, password);
      if (result.status === 200) {
        console.log(result)
        res.status(result.status).json(result.data);
      } else {
        console.log(result)
        res.status(result.status).json({ message: result.message });
      } next();
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "No es posible realizar el login en este momento." });
    };
  } else {
    res.status(400).json({ message: "Ingrese correctamente los datos, por favor." });
  }
};
const createComment = async (req, res, next) => {
  try {
    const result = await general_services.createComment(req);
    if (result.status === 200) {
      res.status(result.status).json(result.message);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    console.log('Error', e);
    res.status(500).json({
      message: 'Por favor, valida los datos ingresados e intenta nuevamente.',
    });
  }
};
const AllComment = async (req, res, next) => {
  try {
    const result = await general_services.AllComment();
    if (result.status === 200) {
      res.status(result.status).json(result.data);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    res.status(500).json('No es posible obtener la información en este momento.');
  }
};
const EdithMessage = async (req, res, next) => {
  try {
    const result = await general_services.EdithMessage(req);
    if (result.status === 200) {
      res.status(result.status).json(result.message);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    console.log('Error', e);
    res.status(500).json({
      message: 'Por favor, valida los datos ingresados e intenta nuevamente.',
    });
  }
};
const EdithMessageStatus = async (req, res, next) => {
  try {
    const result = await general_services.EdithMessageStatus(req);
    if (result.status === 200) {
      res.status(result.status).json(result.message);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    console.log('Error', e);
    res.status(500).json({
      message: 'Por favor, valida los datos ingresados e intenta nuevamente.',
    });
  }
};
const AllMessage = async (req, res, next) => {
  try {
    let dataSend = []
    const result = await general_services.AllMessage();
    if (result.status === 200) {
      // console.log(result.data);
      result.data.forEach(element => {
       let lengthdata=element.body.length; 
       dataSend.push({ idMessage: element.idMessage, body:element.body[lengthdata-1].mensaje ,clientNumber: element.clientNumber, status: element.status, createdAt: element.createdAt, asesora: element.User.name, comment: element.comment ? element.comment.name : "", colour: element.comment ? element.comment.colour : "", phoneAsesor: element.User.phoneNumber });
      }); 
      res.status(result.status).json(dataSend);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    res.status(500).json('No es posible obtener la información en este momento.');
  }

};
const AllMessageUser = async (req, res, next) => {
  try {
    let dataSend = []
    const result = await general_services.AllMessageUser(req);
    if (result.status === 200) {
      result.data.forEach(element => {
        let lengthdata=element.body.length; 
        dataSend.push({ idMessage: element.idMessage, body:element.body[lengthdata-1].mensaje ,clientNumber: element.clientNumber, status: element.status, createdAt: element.createdAt, asesora: element.User.name, comment: element.comment ? element.comment.name : "", colour: element.comment ? element.comment.colour : "", phoneAsesor: element.User.phoneNumber });
       }); 
      res.status(result.status).json(dataSend);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    res.status(500).json('No es posible obtener la información en este momento.');
  }

};
const userInformation = async (req, res, next) => {
  try {
    const result = await general_services.userInformation(req);
    if (result.status === 200) {
      res.status(result.status).json(result.data);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    res.status(500).json('No es posible obtener la información en este momento.');
  }
};
const EdithComment = async (req, res, next) => {
  try {
    const result = await general_services.EdithComment(req);
    if (result.status === 200) {
      res.status(result.status).json(result.message);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    console.log('Error', e);
    res.status(500).json({
      message: 'Por favor, valida los datos ingresados e intenta nuevamente.',
    });
  }
};
const EliminarComment = async (req, res, next) => {
  try {
    const result = await general_services.EliminarComment(req);
    if (result.status === 200) {
      res.status(result.status).json(result.message);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    console.log('Error', e);
    res.status(500).json({
      message: 'Por favor, valida los datos ingresados e intenta nuevamente.',
    });
  }
};
const Downoload = async (req, res, next) => {
  try {
    const { id } = req.headers;
    let array = id.split(',');
    let dataSend = [];
    const Message = await dbSequelize.message.findAll({
      where: { idMessage: array }, include: [{ model: dbSequelize.user, required: true }, { model: dbSequelize.comment }]
    });
    Message.forEach(element => {
      dataSend.push({ idMessage: element.idMessage, Mensaje: element.body == "" ? "Contenido Multimedia" : element.body, NumeroCliente: element.clientNumber, status: element.status == "1" ? "leido" : "No Leido", Fecha_Enviado: element.createdAt, asesora: element.User.name, Comentario: element.comment ? element.comment.name : "No Registrado", Numero_Asesor: element.User.phoneNumber });
    });
    if (dataSend.length > 0) {
      let workbook = Excel.utils.book_new();

      workbook.Props = {
        Title: "Reporte de Mensajes",
        Author: "Accotienda",
        createdAt: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
      };
      workbook.SheetNames.push("Reporte");

      // const processData = processReportByRRHHData(result.data);
      let final_woorkbook = Excel.utils.json_to_sheet(dataSend);

      workbook.Sheets["Reporte"] = final_woorkbook;

      let date = new Date();

      let day = date.getDate();
      let month = date.getMonth();
      let year = date.getFullYear();

      let url = "../../files/ReporteMensajes" + "_" + day + "-" + month + "-" + year + ".xlsx";

      let workbookAbout = Excel.writeFile(workbook, url, { bookType: 'xlsx', type: 'binary' });


      if (url) {
        res.status(200).json(fs.readFileSync(url, 'base64'));
      } else {
        res.status(400).json("Ha ocurrido un error");
      }
    }

  } catch (e) {
    console.log('Error', e);
    res.status(500).json({
      message: 'Por favor, valida los datos ingresados e intenta nuevamente.',
    });
  }

};
const responseMessage = async (req, res, next) => {
  //console.log(req.files,req.files.archivo)
  const { texto, idmessage} = req.headers;
  let files = null;
  let arrayPaths = [];
  let infoMessage = await dbSequelize.message.findByPk(idmessage);
  let chatId = infoMessage.clientNumber; 
  if (flags  ) {
    if(texto!="undefined"){

     
    client.sendMessage(chatId, texto)
      .then(async (Response) => {
        if (Response.id.fromMe) {
          console.log("El mensaje fue enviado Correctamente");
          let dataConsult = infoMessage.body;
           //console.log(dataConsult)
          if (dataConsult != undefined) {
            let description = dataConsult;
            // description = JSON.parse(myEscapedJSONString);
            description.push({ fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }), mensaje: texto,usuario:"asesor" });
            let UpdateMessage = await dbSequelize.message.update({ body: description, status: 1 }, { where: { idMessage: infoMessage.idMessage } });
          }
          else {
            let description = [];
            description.push({ fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }), mensaje: texto,usuario:"asesor" });
            let UpdateMessage = await dbSequelize.message.update({ body: description, status: 1 }, { where: { idMessage: infoMessage.idMessage } });
          }

        }

        res.status(200).json("El mensaje se ha Enviado Correctamente")
      })
    } 
    if(req.files.archivo != undefined){ 
        req.files.archivo.forEach( async function  (element,index) { 
          let filePath = {
            position: index,
            path: path.normalize(element.path),
            mimetype: element.mimetype
          };
          arrayPaths.push(filePath); 
          await uploadFileS3WithPath(filePath.path,`files/mediaSend/`,filePath.mimetype);
         const mediafile=MessageMedia.fromFilePath(`${filePath.path}`)
         client.sendMessage(chatId,mediafile)
            let description = infoMessage.body;
            description.push({ fecha: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }), mensaje: filePath.path,usuario:"asesor" });
            await dbSequelize.message.update({ body: description }, { where: { idMessage: idmessage } });
         });
         
        
      }
      files = {   filePaths: arrayPaths };
      res.status(200).json("Mensaje Enviado Correctamente ")
  }
  else {
    res.status(400).json("Aun no ha Iniciado session")
  }
};
const ByOneMessage=async(req,res,next)=>{
  try {
    const result = await general_services.ByOneMessage(req);
    if (result.status === 200) {
      //console.log(result.data);
      res.status(result.status).json(result.data);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    res.status(500).json('No es posible obtener la información en este momento.');
  }

};
const get64Img=async(req,res,next)=>{
  try { 
      const {ruta}=req.headers;
      next();
    res.status(200).json(fs.readFileSync(ruta, 'base64'))
  } catch (e) {
    res.status(500).json('No es posible obtener la información en este momento.');
  }
};
const getByUsers=async(req,res,next)=>{ 
try {
  const result = await general_services.getByUsers(req);
  if (result.status === 200) {
    //console.log(result.data);
    res.status(result.status).json(result.data);
  } else {
    res.status(result.status).json(result.message);
  }
  next();
} catch (e) {
  res.status(500).json('No es posible obtener la información en este momento.');
}

};
const newAnserw=async(req,res,next)=>{
  try {
    const result = await general_services.newAnserw(req);
    if (result.status === 200) {
      //console.log(result.data);
      res.status(result.status).json(result.data);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    res.status(500).json('No es posible obtener la información en este momento.');
  }
};
const deleteAnserw=async(req,res,next)=>{
  try {
    const result = await general_services.deleteAnserw(req);
    if (result.status === 200) {
      res.status(result.status).json(result.message);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    console.log('Error', e);
    res.status(500).json({
      message: 'Por favor, valida los datos ingresados e intenta nuevamente.',
    });
  }
};
const EdithAnserw = async (req, res, next) => {
  try {
    const result = await general_services.EdithAnserw(req);
    if (result.status === 200) {
      res.status(result.status).json(result.message);
    } else {
      res.status(result.status).json(result.message);
    }
    next();
  } catch (e) {
    console.log('Error', e);
    res.status(500).json({
      message: 'Por favor, valida los datos ingresados e intenta nuevamente.',
    });
  }
};

module.exports = {EdithAnserw,deleteAnserw,newAnserw,getByUsers,get64Img,ByOneMessage, responseMessage, Downoload, withOutSession, EliminarComment, EdithComment, userInformation, EdithMessageStatus, AllMessageUser, AllMessage, createComment, AllComment, AllUser, createUser, makeLogin, EdithMessage }
