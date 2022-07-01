const { network } = require("hardhat");


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
    log(`---------Deployed at ${deployer}-----------`)
}