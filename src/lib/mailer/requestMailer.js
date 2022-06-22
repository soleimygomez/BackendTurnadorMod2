//Requires
const path = require('path');
const fs = require('fs-extra');
const hbs = require('handlebars');
const { sendEmail } = require('../../utils/utils.js');

//Functions
const compile = async function (templateName, data) {

  //Production
  let filePath = "";
  if (fs.existsSync(dirPath)) {
    filePath = path.join(process.cwd(), '../files/templates', `${templateName}.hbs`);
  } else {
    filePath = path.join(process.cwd(), '..\\files\\templates', `${templateName}.hbs`);
  }
  const html = await fs.readFile(filePath, 'utf-8');
  let template = hbs.compile(html);

  let result = template(data);

  return result;

};

//Global Mailer
const mailer = {};

mailer.requestAuthorizationMailer = async (userData, email, requestid) => {

  try {


    let subject = 'Avanzo (Créditos al instante) - Aprobación de solicitud  No. ' + requestid;
    let text = 'Avanzo Créditos';

    sendEmail('approveRequest', userData, '', '', subject, text, false)

  } catch (e) {
    console.log(e);
  }

};

module.exports = mailer;