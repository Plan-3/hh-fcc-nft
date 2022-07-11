const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const key = process.env.PINATA_API
const secret = process.env.PINATA_SECRET 
const pinata = pinataSDK(key, secret)

async function storeImages(imagesFilePath){
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = [];
    for(fileIndex in files){
        const readeableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        try{
            const response = await pinata.pinFileToIPFS(readeableStreamForFile)
            responses.push(response)
        }catch(error){
            console.log(error);
        }
    }
    return {responses, files}
}

async function storeTokenUriMetadata(metaData){
    try{
        const response = await pinata.pinJSONToIPFS(metaData)
        return response
    }catch (error){
        console.log(error);
    }
}

module.exports = {storeImages, storeTokenUriMetadata};