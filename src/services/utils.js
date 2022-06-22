
//Requires
const pool = require('../config/database.js');




const registerSMS = async (to, body,requestid,count,idClient,countClient) => {

  try {
     let sms;
    if(count!=0) { 
      sms={sms_to: to,  sms_body: body,  idRequest:requestid,}
      }
    else{   
      sms={   sms_to: to,   sms_body: body,  idClient:idClient, CountClient:countClient  
      }; 
    }
    
   const SMSQuery = await pool.query('INSERT INTO Sms SET ?', [sms]); 
    if (SMSQuery !== '[]') {
      return { status: 200, data: SMSQuery };
    } else {
      return { status: 200, data: false };
    }
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." };
  }

};
const updateSMS = async (count,sms_id,countClient,idClient) => {
   
  try {
   // utilizar sequelize 
   let SMSQuery=null;
   if(idClient===undefined || idClient==="") {
     try{
    SMSQuery = await dbSequelize.sms.update({ Count:count}, { where: { sms_id: sms_id} });}
     catch (e) { console.log(e);return { status: 500, message: "Error interno del servidor." };
      }
    }
   else{
    try{ SMSQuery = await dbSequelize.sms.update({ CountClient:countClient}, { where: { sms_id: sms_id} });}
      catch (e) { console.log(e);return { status: 500, message: "Error interno del servidor." };
      }
   }
   if (SMSQuery !== '[]') {
      return { status: 200, data: SMSQuery };
    } else {
      return { status: 200, data: false };
    }
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." };
  }

};
const registerEmail = async (email_subject, email_text, email_template_name, email_attachment_name, email_attachment_type, email_path_file_to_compile, email_user_data,requestId,email_sent,clientid,countClient) => {
   
  try {
     let mail ;
     if(email_sent!=0) { 
      mail={  email_subject: email_subject,  email_text: email_text,   email_template_name: email_template_name,
      email_attachment_name: email_attachment_name,    email_attachment_type: email_attachment_type,
      email_path_file_to_compile: email_path_file_to_compile,   email_user_data: JSON.stringify(email_user_data),
      requestId:requestId,}
    }
    else{
      mail={   email_subject: email_subject,  email_text: email_text,   email_template_name: email_template_name,
        email_attachment_name: email_attachment_name,  email_attachment_type: email_attachment_type,   email_path_file_to_compile: email_path_file_to_compile,
        email_user_data: JSON.stringify(email_user_data),  clientId:clientid,  email_client:countClient
    }
    }
     
    const emailQuery = await pool.query('INSERT INTO Emails SET ?', [mail]);
  
    if (emailQuery !== '[]') {
      return { status: 200, data: emailQuery };
    } else {
      return { status: 200, data: false };
    }
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." };
  }

};

const updateEmail = async (email_sent,email_id,countClient,idClient) => {
   
  try {
    
     let emailQuery=null;
    if(idClient===undefined || idClient===""){
      try{ emailQuery=await dbSequelize.emails.update({ email_sent:email_sent}, { where: { email_id: email_id} }); }
      catch (e) { console.log(e);return { status: 500, message: "Error interno del servidor." };
      }
    } else{
      try{emailQuery=await dbSequelize.emails.update({ email_client:countClient}, { where: { email_id: email_id} });}
      catch (e) { console.log(e);return { status: 500, message: "Error interno del servidor." };}
    } 
    if (emailQuery !== '[]') {
      return { status: 200, data: emailQuery };
    } else {
      return { status: 200, data: false };
    }
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." };
  }

};

const changeStateMail = async (email_id, state) => {

  try {

    const emailQuery = await pool.query('UPDATE Emails SET ? where email_id = ?', [{ email_sent: state }, email_id]);



    if (emailQuery !== '[]') {
      return { status: 200, data: true };
    } else {
      return { status: 200, data: false };
    }
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." };
  }

};


const changeStateSMS = async (sms_id, state) => {

  try {
    const emailQuery = await pool.query('UPDATESmsSET ? where sms_id = ?', [{ sms_forwarded: state }, sms_id]);
    if (emailQuery !== '[]') {
      return { status: 200, data: true };
    } else {
      return { status: 200, data: false };
    }
  } catch (e) {
    console.log(e);
    return { status: 500, message: "Error interno del servidor." };
  }

};


module.exports = { registerSMS, registerEmail, changeStateMail, changeStateSMS,updateEmail,updateSMS }