//Requires
const jwt = require('jsonwebtoken');
var fs = require("fs");
 
//Verify token
const verifyToken = async (req, res, next) => {
  
  try{
    //Get header value
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){ 
      //Get the real token
      const bearer = bearerHeader.split(" ")[1];
      //Set the token
    
        jwt.verify(bearer, "12345", (err) => {
          if(err){
            res.sendStatus(403).json({message: "El token es inválido o la sesión ha expirado. Por favor, vuelva a ingresar."});
          }else{ next();  }  });
    }else{ res.sendStatus(401).json({message: "El usuario no tiene permisos para acceder a este recurso."});
    }
  }catch(e){ return false;  }
};

module.exports = { verifyToken};
