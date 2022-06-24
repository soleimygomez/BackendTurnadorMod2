const helpers = require('../lib/helpers');
const expirationTime = 5;
const jwt = require('jsonwebtoken');
const dbSequelize = require('../config/database_sequelize.js'); 

const sequelize = dbSequelize.sequelize;
const Sequelize = dbSequelize.Sequelize;

const Op = dbSequelize.Sequelize.Op;
//Services
const createUser = async (req) => {
   
  const{email, password,name,phonenumber,role_idrole }=req.headers
  console.log(email, password,name,phonenumber,role_idrole)
  try {
    let userRow
    if(parseInt(role_idrole)===1){
      console.log("/************* admin ***********/")
      let admin={  email:email,  name:name, phoneNumber:phonenumber,Role_idRole:parseInt(role_idrole)}
      userRow = await dbSequelize.user.create(admin);
      //console.log(userRow.idUser)
    }
    else if(parseInt(role_idrole)===2){
      console.log("/************* asesor***********/")
      const Users = await dbSequelize.user.findAll({where:{Role_idRole:2}});
      
      Users.forEach(async (element) => { 
          await dbSequelize.user.update({  count: 0}, {  where: { idUser:element.idUser, }  }); 
      });
      let asesor={email:email,  name:name, phoneNumber:phonenumber,Role_idRole:parseInt(role_idrole)}
      userRow=await dbSequelize.user.create(asesor);
    } 
    const new_date = new Date();
    new_date.setHours(new_date.getHours() + expirationTime);
      //Auth
     // console.log(userRow)
    const newAuth = {
        User_idUser: userRow.idUser, expiresOn: new_date.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      };
    newAuth.password = await helpers.encryptPassword(password);
      // const authQuery = await pool.query('INSERT INTO Auth SET ?', [newAuth]);
    const authQuery = await dbSequelize.auth.create(newAuth);

    if(authQuery){
      return { status: 200, message: "Usuario creando satisfactoriamente" };
    }
     else{return { status: 404, message: "Error creando Auth " };}
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." }}
}; 

const login = async (email, password) => {
   
  try {//console.log("aqui lle")
    const consultEmail = await dbSequelize.user.findOne({
     where: { email: email },  });
   
     if (consultEmail) {
     
     let userQuery = await dbSequelize.user.findOne({
       where: { email: email },
       include: [{  model: dbSequelize.auth, required: true}]
     });
     // console.log(userQuery)
     if (userQuery) {
           const userAuth = { expiresOn: userQuery.expiresOn };
           const userDataPlana = { idUser: userQuery.idUser, name: userQuery.name, email: userQuery.email, roleId: userQuery.Role_idRole };
           const validPassword = await helpers.matchPassword(password, userQuery.Auth.password);
           //console.log("VP",validPassword);
           if (validPassword) {
             let userData = {};
             userData.idUser = userQuery.idUser
             userData.Role_idRole = userQuery.Role_idRole
             const jwtoken = jwt.sign({ userData },'123456',{ expiresIn: '8h' });
             const new_date = new Date();
             new_date.setHours(new_date.getHours() + expirationTime - 1);
             userAuth.expiresOn = new_date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
            
             await userQuery.Auth.update(userAuth);
             console.log(userDataPlana);
             return {
               status: 200, message: "Ha ingresado satisfactoriamente.",
               data: { access_token: jwtoken, expires_on: userAuth.expiresOn, user_info: userDataPlana },

             };
           } else {
              return { status: 400, message: "La contraseña es incorrecta." };
           }
          
       
      
     } else {
       return { status: 400, message: "Tu usuario no se encuentra en nuestro sistema o está inhabilitado, por favor realiza el registro en la plataforma o contáctate con nosotros." };
      // throw { status: 400, message: "Tu usuario no se encuentra en nuestro sistema o está inhabilitado, por favor realiza el registro en la plataforma o contáctate con nosotros." };

     }
   } else{
     return { status: 400, message: "Tu usuario no se encuentra en nuestro sistema." };
   } 
 }  catch (e) {
   console.log(e);
   return { status: 500, data: [], message: "Error interno del servidor." };
   }
};
const AllUser=async()=>{
  try {
    const Users = await dbSequelize.user.findAll({
      attributes: ["idUser", "email","name" ,"phoneNumber","Role_idRole","count"],
      where:{Role_idRole:2},
      include: [ { model: dbSequelize.rol }, ]
    });
    return { status: 200, data: Users };
  } catch (e) {
    console.log(e);
    //throw e;
    return { status: 500, data: [], message: "Error interno del servidor." };
  }
};
const userInformation=async(req)=>{
  try {
    const{rol,iduser}=req.headers;
    console.log(rol);
    console.log(typeof(rol))
    if(rol==="1"){
      const MessageNotLeido= await dbSequelize.message.findAll({ where:{status:0},include:[{model:dbSequelize.user, required:true}] });
      const Llegados=await dbSequelize.message.findAll({ });
      //let User=await dbSequelize.user.findAll({ where:{Role_idRole:2}});
      let messageStadisc=({noLeidos:MessageNotLeido.length,llegados:Llegados.length});
      return { status: 200, data: messageStadisc};
    }
    if(rol==="2"){
      const MessageNotLeido= await dbSequelize.message.findAll({ where:{status:0,idUser:iduser},include:[{model:dbSequelize.user, required:true}] });
      const Llegados=await dbSequelize.message.findAll({ where:{idUser:iduser} });
      //let User=await dbSequelize.user.findAll({ where:{Role_idRole:2}});
      let messageStadisc=({noLeidos:MessageNotLeido.length,llegados:Llegados.length});
      return { status: 200, data: messageStadisc};
    }
     
  } catch (e) {
    console.log(e);
    //throw e;
    return { status: 500, data: [], message: "Error interno del servidor." };
  }
};
const createComment=async(req)=>{
    try {
      // console.log(req.headers)
      const {name, colour } = req.headers;
      let Comment={name:name,colour:colour};
      let commentRow =   await dbSequelize.comment.create(Comment);
      if(commentRow){
        return { status: 200, message: "El comentario creando satisfactoriamente" };
      }
       else{return { status: 404, message: "Error creando el producto" };}
    }
    catch (e) {
      console.log(e);
      return { status: 500, message: "Error interno del servidor." }}
 
};
const AllComment=async()=>{
  try {
    const Users = await dbSequelize.comment.findAll({  });
    return { status: 200, data: Users };
  } catch (e) {
    console.log(e);
    //throw e;
    return { status: 500, data: [], message: "Error interno del servidor." };
  }
};
const EdithMessage=async(req)=>{
  try { 
  const {id, comment } = req.headers;
  
  console.log(id, comment )
  let messageRow =   await dbSequelize.message.update({  idComment: comment }, {  where: { idMessage : id, }
  });
  if(messageRow){
    return { status: 200, message: "El mensaje se ha actualizado correctamente" };
  }
   else{return { status: 404, message: "Error actualizando el mensaje" };}
  }
  catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." }}
};
const AggContact=async(req)=>{
  try { 
  const {id, name } = req.headers;
   
  let messageRow =   await dbSequelize.message.update({  nameClient: name }, {  where: { idMessage : id, }
  });
  if(messageRow){
    return { status: 200, message: "El mensaje se ha actualizado correctamente" };
  }
   else{return { status: 404, message: "Error actualizando el mensaje" };}
  }
  catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." }}
};
const EdithMessageStatus=async(req)=>{
  try {
  const {id} = req.headers;
  let messageRow =   await dbSequelize.message.update({  status: 1 }, {  where: { idMessage : id, } });
  if(messageRow){
    return { status: 200, message: "El mensaje se ha actualizado correctamente" };
  }
   else{return { status: 404, message: "Error actualizando el mensaje" };}
  }
  catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." }}
};
const AllMessage=async()=>{
  try {
    const Message= await dbSequelize.message.findAll({ include: [ { model: dbSequelize.user,required:true },{ model: dbSequelize.comment } ],order: [['idMessage', 'DESC']]  });
    return { status: 200, data: Message };
  } catch (e) {
    console.log(e);
    //throw e;
    return { status: 500, data: [], message: "Error interno del servidor." };
  }
};
const AllMessageUser=async(req)=>{
  try {
    const {iduser}=req.headers;
    const Message= await dbSequelize.message.findAll({where:{idUser:iduser}, include: [ { model: dbSequelize.user,required:true },{ model: dbSequelize.comment } ],order: [['updatedAt', 'DESC']]  });
    return { status: 200, data: Message };
  } catch (e) {
    console.log(e);
    //throw e;
    return { status: 500, data: [], message: "Error interno del servidor." };
  }
};
const EdithComment=async(req)=>{
  try {
   // console.log(req)
    const {id,comment,colour} = req.headers;
    let messageRow =   await dbSequelize.comment.update({  comment: comment ,colour:colour}, {  where: { idComment : id, } });
    if(messageRow){
      return { status: 200, message: "El Comentario se ha actualizado correctamente" };
    }
     else{return { status: 404, message: "Error actualizando el Commentario" };}
    }
    catch (e) {
      console.log(e);
      return { status: 500, message: "Error interno del servidor." }}

};
const EliminarComment=async(req)=>{
  try {
   // console.log(req)
    const {id} = req.headers;
    let messageRow =   await dbSequelize.comment.destroy({  where: { idComment : id, } });
    if(messageRow){
      return { status: 200, message: "El Comentario se ha Eliminado correctamente" };
    }
     else{return { status: 404, message: "Error actualizando el Commentario" };}
    }
    catch (e) {
      console.log(e);
      return { status: 500, message: "Error interno del servidor." }}

};
const ByOneMessage=async(req)=>{
  try {
    const {idmessage}=req.headers;
    const Message= await dbSequelize.message.findOne({ include: [ { model: dbSequelize.user,required:true }] ,where:{idMessage:idmessage} });
    return { status: 200, data: Message };
  } catch (e) {
    console.log(e);
    //throw e;
    return { status: 500, data: [], message: "Error interno del servidor." };
  }
};
const getByUsers=async(req)=>{ 
try {
  const {iduser}=req.headers;
  const Message= await dbSequelize.anserwFlash.findAll({where:{idUser:iduser}});
  return { status: 200, data: Message };
} catch (e) {
  console.log(e);
  //throw e;
  return { status: 500, data: [], message: "Error interno del servidor." };
}
};
const newAnserw=async(req)=>{
  try {
    const {iduser,texto}=req.headers;
    const Message= await dbSequelize.anserwFlash.create({texto:texto,idUser:iduser});
    return { status: 200, data: "Creado Correctamente" };
  } catch (e) {
    console.log(e);
    //throw e;
    return { status: 500, data: [], message: "Error interno del servidor." };
  }
};
const deleteAnserw=async(req)=>{
  try { 
    const {idanserw} = req.headers;
    let messageRow =   await dbSequelize.anserwFlash.destroy({  where: { idAnserwFlash : idanserw, } });
    if(messageRow){
      return { status: 200, message: "La respuesta rapida se ha Eliminado correctamente" };
    }
     else{return { status: 404, message: "Error actualizando el Commentario" };}
    }
    catch (e) {
      console.log(e);
      return { status: 500, message: "Error interno del servidor." }}

};
const EdithAnserw=async(req)=>{
  try {
   // console.log(req)
    const {id,text} = req.headers;
    let messageRow =   await dbSequelize.anserwFlash.update({  texto: text }, {  where: { idAnserwFlash : id, } });
    if(messageRow){
      return { status: 200, message: "La respuesta rapida se ha actualizado correctamente" };
    }
     else{return { status: 404, message: "Error actualizando la Respuesta Rapida" };}
    }
    catch (e) {
      console.log(e);
      return { status: 500, message: "Error interno del servidor." }}

};

module.exports = {AggContact,EdithAnserw,deleteAnserw,newAnserw,getByUsers,ByOneMessage,EliminarComment,EdithComment,userInformation,EdithMessageStatus,AllMessageUser,EdithMessage,AllComment,createUser,login,AllUser,createComment,AllMessage };
