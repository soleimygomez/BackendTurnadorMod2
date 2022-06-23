const { Client, LegacySessionAuth, LocalAuth } = require('whatsapp-web.js');
const http = require('http'); // or 'https' for https:// URLs
const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const qr = require('qr-image')

const MULTI_DEVICE = process.env.MULTI_DEVICE || 'true';

const cleanNumber = (number) => {
    number = number.replace('@c.us', '');
    number = `${number}@c.us`;
    return number
}

 
const checkIsUrl = (path) => {
    try{
        regex = /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/i;
        match = path.match(regex);
        return match[0]
    }catch(e){
        return null
    }
}

const generateImage = (base64, cb = () => {}) => {
    let qr_svg = qr.image(base64, { type: 'svg', margin: 4 }); 
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
    cb()
}

 

const checkEnvFile = () => {
    const pathEnv = `${__dirname}/../../...env`;
    const isExist = fs.existsSync(pathEnv);
    if(!isExist){
        console.log(`🆗 ATENCION! 🆗 te falta crear tu archivo .env de lo contrario no funcionara`)
    }
}

/**
 * 
 * @param {*} session 
 * @param {*} cb 
 */
const createClient =  (session = {}, login = false) => {
    console.log(`Mode: ${(MULTI_DEVICE === 'false') ? 'No Multi-device' : 'Si Multi-device'} `)
    const objectLegacy = (login) ? {
        authStrategy: new LegacySessionAuth({
            session
        })
    } : {session};

    return {...objectLegacy, restartOnAuthFail: true, puppeteer: {
        args: [ '--no-sandbox'  ] ,headless: false, read_timeout: 60000
    } }
}

const isValidNumber = (rawNumber) => {
    const regexGroup = /\@g.us\b/gm;
    const exist = rawNumber.match(regexGroup);
    return !exist
}

module.exports = {cleanNumber,   generateImage, checkIsUrl, checkEnvFile, createClient, isValidNumber}