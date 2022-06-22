const mimeDb = require('mime-db')
const fs = require('fs');
const { uploadFileS3WithPath } = require('../utils/utils');

/**
 * Guardamos archivos multimedia que nuestro cliente nos envie!
 * @param {*} media 
 */

const saveMedia = async(media, from) => {
    const extensionProcess = mimeDb[media.mimetype];
    fs.mkdirSync(`./files/media/${from.replace('@c.us', '')}`,{recursive:true});
    if (extensionProcess) {
        const ext = extensionProcess.extensions[0];
        fs.mkdirSync(`./files/media/${from.replace('@c.us', '')}`,{recursive:true});
        let url = `./files/media/${from.replace('@c.us', '')}/${from.replace('@c.us', '')}-${Date.now()}.${ext}`;
        fs.writeFileSync(url, media.data,'base64') 
        console.log('** Archivo Media Guardado **');
       
        let subidaAWS=await uploadFileS3WithPath(url,`files/media/${from.replace('@c.us', '')}/`,ext)
        return { status: 200, data: url, ext:extensionProcess };
    }
    else{  
        let url = `./files/media/${from.replace('@c.us', '')}/${from.replace('@c.us', '')}-${Date.now()}.mp3`;
        fs.writeFileSync(url, media.data, 'base64') 
            console.log('** Audio Guardado **');
        let subidaAWS=   await uploadFileS3WithPath(url,`files/media/${from.replace('@c.us', '')}/`,'mp3')
        return { status: 200,  data:url, ext:extensionProcess };
    }

}

module.exports = { saveMedia }