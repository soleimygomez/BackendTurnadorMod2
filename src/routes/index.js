//Requires
const express = require('express');
 
const generalRoutes=require('./general.js');
//const dbSequelize = require('../config/database_sequelize.js');
//definicion de Rutas
function routerApi(app){
    const router=express.Router();
    app.use('/API/v1',router);
    router.use('/general',generalRoutes);
}

module.exports =routerApi;