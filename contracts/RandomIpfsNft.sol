//SPDX

//comes with function to set token uri, same as erc721 with some additional customization, constructor can still use erc721
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "hardhat/console.sol";

pragma solidity ^0.6.0;

error RandomIpfsNft__RangeOutOfBounds;

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage {

    enum Breed {
        PUG,
        SHIBA INU,
        ST. BERNARD
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint16 private constant NUM_WORDS = 1;

    mapping(uint256=>address) public s_requestIdToSender;

    uint256 public s_tokenCounter = 0;
    uint256 public Max_Chance_Value = 100;

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId, 
        bytes32 gasLane, 
        uint32 callbackGasLimit
        )VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "INFT")
        {
            i_subscriptionId = subscriptionId;
            i_gasLane = gasLane;
            i_callbackGasLimit = callbackGasLimit;
        }

    function requestNft()public returns(uint256 requestId){
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, 
            i_subscriptionId, 
            REQUEST_CONFIRMATIONS, 
            i_callbackGasLimit, 
            NUM_WORDS
            );
            s_requestIdToSender[requestId] = msg.sender;
    }

    function fulfillRandomWords(
        uint256 requestId, 
        uint256[] memory randomWords
        ) 
        internal
        override
        {
            address dogOwner = s_requestIdToSender[requestId];
            uint256 newTokenId = s_tokenCounter;
         
            uint256 moddedRng = randomWords[0] % Max_Chance_Value;
            //always gives number between 0-99 
            Breed dogBreed = getBreedFromModdedRng(moddedRng);
            _safeMint(dogOwner, newTokenId);
        }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns(Breed){
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            //checks for range that moddedRng falls in, each loop cumulativeSum inceases until modded rng falls into that range
            if(moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]){
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds;
    }

    function getChanceArray() public pure returns(uint256[3] memory){
        // index 0:10% 1:20% 2:60%
        return [10,30,Max_Chance_Value];
    }

    function tokenURI(uint256) public view override returns(string memory){

    }
}