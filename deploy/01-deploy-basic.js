const { network } = require("hardhat");
const {development, networkConfig} = require("../helper-hardhat-config")
const {verify} = require("../utils/verify.js")


module.exports = async function({getNamedAccounts, deployments}) {
    const{deploy, log} = deployments;
    const{deployer} = await getNamedAccounts();

    log("--------------------------")
    const args = [];
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    if(!development.includes(network.name) && process.env.ETHERSCAN_API){
        log("Verifying....")
        await verify(basicNft.address, args)
    }
    log("----------Verified----------")
    log(`---------Deployed at-----------`)
}