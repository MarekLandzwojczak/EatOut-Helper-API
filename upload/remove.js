const cloud = require("@google-cloud/storage");
const keys = require("./GoogleCloud.json");
const { Storage } = cloud;
const storage = new Storage(keys);
const bucket = storage.bucket("eatout");

const removeImage = ( name , idUser, idPlace) =>
  new Promise((resolve, reject) => {
      try{
    bucket.file(`${idUser}/${idPlace}/${name}`).delete();
      }
      catch(error){
          
      }
    
    resolve(true)
    
  });
module.exports = removeImage;