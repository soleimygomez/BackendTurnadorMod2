//Requires
const express = require('express');
const { body } = require('express-validator'); 

//Initialize
const router = express.Router();
const multer = require('multer');
const mkdirp = require('mkdirp');
const { v4: uuid } = require('uuid');
//Controllers
const { verifyToken } = require('../controllers/validator');
const general_controller = require('../controllers/general');
var removeAccents = require('remove-accents');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      //Get the clientId
      const bearerHeader = req.headers["authorization"];
      //Get the real token
      const bearer = bearerHeader.split(" ")[1];
      //Set the token
      //const decoded = jwt.decode(bearer); 
      var dest = "./files/mediaSend/";
      mkdirp.sync(dest);
      callback(null, dest);
    },
    filename: function (req, file, callback) { 
      let name = file.fieldname;
      let UUID = uuid().split("-")[0] + uuid().split("-")[0];
      callback(null, UUID + "-" + removeAccents(file.originalname.replace(/ /g, "")));
  
    },
  });
 
const avatarUpload = multer({
    storage: storage,
    limits: {  fileSize: 1024 * 1024 * 5,  },
  }).fields([{ name: "archivo", maxCount: 10 }]);
  
function checkAvatarUpload(req, res, next) {
    try {
      avatarUpload(req, res, (err) => {
        if (err) { return res.status(400).json({message:"Uno o varios de los archivo/s cargado/s es/son muy pesado/s. Modifícalo/s e intenta de nuevo, por favor.",});
        }
        next();
      });
    } catch (err) {
      console.log("Error", err);
    }
  }

//****************************************************** */
//****************************************************** */
//Usuario
router.post('/User/Create', general_controller.createUser);
router.get('/User/All', general_controller.AllUser);

//****************************************************** */
//****************************************************** */
//codigo Qr
router.get('/User/Qr',general_controller.withOutSession);
// router.get('/QR',general_controller.getQr);
//****************************************************** */
//****************************************************** */
//login
router.post('/Account/Token', [body('email', 'Email inválido').exists().isEmail(),
body('password', "La contraseña es incorrecta123").exists(),], general_controller.makeLogin); 

//****************************************************** */
//****************************************************** */
//comentario
router.post('/Comment/CreateComment', general_controller.createComment);
router.get('/Comment/AllComment', general_controller.AllComment);
router.put('/Comment/EditarComment', general_controller.EdithComment);
router.delete('/Comment/EliminarComment', general_controller.EliminarComment);
//****************************************************** */
//****************************************************** */
//message
router.get('/Message/ObtenerImg',general_controller.get64Img)
router.put('/Message/ResponderMessage',checkAvatarUpload, general_controller.responseMessage);
router.put('/Message/EditarMessage', general_controller.EdithMessage);
router.put('/Message/EditarMessageStatus', general_controller.EdithMessageStatus);
router.get('/Message/AllMessage', general_controller.AllMessage);
router.get('/Message/OneMessage', general_controller.ByOneMessage);
router.get('/Message/AllMessageByAsesora', general_controller.AllMessageUser);
router.get('/Message/userInformation',general_controller.userInformation);
router.get('/Message/Downoload',general_controller.Downoload);
router.put('/Message/AggContact', general_controller.AggContact);
//*************************************************************** */
//*************************************************************** */
//Respuestas Rapidas

router.get('/AnserwFlash/getByUsers',general_controller.getByUsers)
router.post('/AnserwFlash/newAnserw',general_controller.newAnserw)
router.delete('/AnserwFlash/deleteAnserw', general_controller.deleteAnserw);
router.put('/AnserwFlash/EdithAnserw', general_controller.EdithAnserw);  
//Export
module.exports = router;
