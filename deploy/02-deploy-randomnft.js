const { network, ethers } = require("hardhat");
const {development, networkConfig} = require("../helper-hardhat-config")
const {verify} = require("../utils/verify.js")
const {storeImages, storeTokenUriMetadata} = require("../utils/uploadToPinata")
require("dotenv").config()


const imageLocation = "./images/randomNFT"
const metaDataTemplate = {
    name: "",
    description:"",
    image:"",
    attributes: [
        {
            trait_type: "Speed",
            value: 100
        }
    ]
}
let tokenUris = [
    'ipfs://QmbpBoxkic8qmDhpAwHRmMr66GMaZfXC42DLMrZjaJnL1f',
    'ipfs://QmcWdGgHvYtGybkm7QJUVHmmcoUeeGx1YXCkKBmYe4Hked',
    'ipfs://QmY1ixmFy4cvkSbeqjQxi9wiQHdR3akdSLyBKLyMgo9TNC'
]

module.exports = async function({getNamedAccounts, deployments}) {
    const{deploy, log} = deployments;
    const{deployer} = await getNamedAccounts();
    let chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId


    log("--------------------------")
    //pin images to either ipfs through cli, use pinata, nftStorage
    if(process.env.Upload_to_Pinata == "true"){
        tokenUris = await handleTokenUris();
    }



    if(chainId == 31337){
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const tx = await VRFCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subscriptionId = txReceipt.events[0].args.subId
    }else{
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    await storeImages(imageLocation)
    const args = [
        vrfCoordinatorV2Address, 
        subscriptionId, 
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["callbackGasLimit"],
        tokenUris,
        networkConfig[chainId]["mintFee"],
    ];
    
   console.log("before deploy");
   console.log(args);
    const randomNft = await deploy("RandomIpfsNft", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1
        })
        console.log(`${deployer}`);
        if(!development.includes(network.name) && process.env.ETHERSCAN_API){
                log("Verifying....")
                await verify(randomNft.address, args)
            }
            log("----------Verified----------")
            log(`---------Deployed at-----------`)
}
        
async function handleTokenUris() {
    const {responses: imageUploadResponses, files} = await storeImages(imageLocation)
        for(imageUploadResponseIndex in imageUploadResponses){
            //set metadata
            let tokenUrimetadata = { ...metaDataTemplate}
            tokenUrimetadata.name = files[imageUploadResponseIndex].replace(".png", "")
            tokenUrimetadata.description = `An adorable ${tokenUrimetadata.name} pup!`
            tokenUrimetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
       
            //wait for pinata to store metadata, then grab link for where its stored
            const metadataUploadResponse = await storeTokenUriMetadata(tokenUrimetadata)
            tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
        }
            console.log(tokenUris);
            return tokenUris
}
        module.exports.tags = ["all", "random", "all"]