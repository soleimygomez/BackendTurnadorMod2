//Requires
// const { validationResult } = require('express-validator');
// const jwt = require('jsonwebtoken');
// const Excel = require('xlsx');

//Imports
var request = require('request');
const fs = require('fs-extra');
var pdf = require('html-pdf');

//variables de entorno
const dotenv = require("dotenv");
dotenv.config();


var fse = require('fs');
const dbSequelize = require('../config/database_sequelize.js'); 
sequelize = dbSequelize.sequelize,
  Sequelize = dbSequelize.Sequelize;
const AWS = require('aws-sdk');
var mimemessage = require('mimemessage');
const global=require('./../config/global.js')
const SES_CONFIG = {
  accessKeyId: global.ACCESS_KEY_ID,
  secretAccessKey:global.SECRET_ACCESS_KEY,
  region: global.REGION,
};
const AWS_SES = new AWS.SES(SES_CONFIG);

const hbs = require('handlebars');
const path = require('path');
 
const s3 = new AWS.S3({
  accessKeyId: global.ACCESS_KEY_ID,
  secretAccessKey: global.SECRET_ACCESS_KEY
})
  
  

async function uploadFileS3(bufferData, path = 'files', contentType) {
   
  //convertimos la imagen en blob para enviar a amazon
  // var bitmap = fs.readFileSync(imagePath);
  // var bufferImage = new Buffer.from(bitmap);


  // console.log("Archivo a cargar a S3: " + filePath);
  // const fileData = fse.readFileSync(filePath);
  const fileData = bufferData;

  const params = {
    Bucket:global.BUCKET_NAME, //Enter the bucket name that you created
    Key: path,//path.basename(filePath), //filename to use on the cloud
    Body: fileData,
    ContentType: contentType,
    CacheControl: "max-age=172800",
    //ACL: "public-read", //To make file publicly accessible through URL
  };
  console.log(params)
  return new Promise(resolve => {

    s3.upload(params, function (error, data) {
      if (error) {
        resolve(error);
        // throw error;
      }
      console.log(`File was Uploaded Successfully. ${data.Location}`);
      resolve(data);

    });


  })
}

async function uploadFileS3WithPath(filePath, folder, contentType) {
  if(filePath.includes("status@broadcast")){
    return 
  }
  const fileData = fse.readFileSync(`${filePath}`); 
  console.log("_______________________________________________________");
  console.log("llega a subir archivos a amazon uploadFileS3WithPath");
  // console.log(filePath);
  // console.log(folder);
  // console.log(contentType);
  // console.log(path.basename(filePath));
  // console.log(global.BUCKET_NAME);
  // console.log("file data",fileData.buffer)
  const params = {
    Bucket: global.BUCKET_NAME, //Enter the bucket name that you created
    Key: folder + path.basename(filePath), //filename to use on the cloud
    Body: fileData,
    ContentType: contentType, 
    //ACL: "public-read" //To make file publicly accessible through URL
  };

 // console.log(params);
  return new Promise(resolve => {

    s3.upload(params, function (error, data) {
      if (error) {
          console.log(error)
        console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::");
        console.log(":::::::::: ERROR AL SUBIR ARCHIVOS A AMAZON ::::::::::");
        resolve(error);
        console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::");

        // throw error;
      }
      //console.log(data)
      console.log(`File was Uploaded Successfully. ${data}`);
      resolve(data);

    });
    return { status: 200, url: params.Key};

  })
}
 

module.exports = { uploadFileS3,  uploadFileS3WithPath};