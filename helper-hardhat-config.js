const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "Rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFee: ethers.utils.parseEther('0.01'),
        gasLimit: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "6866",
        callbackGasLimit: "500000",
        interval: "30",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        mintFee: "1"
    },
    31337:{
        name: "hardhat",
        subscriptionId: "588",
        entranceFee: ethers.utils.parseEther('0.01'),
        gasLimit: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
        interval: "30",
        mintFee: "1000000000000000000",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    }
}

const development = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    development
}