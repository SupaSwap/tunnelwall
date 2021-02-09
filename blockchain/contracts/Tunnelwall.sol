// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

contract Tunnelwall {
    
    struct Message {
        bytes32 text;   // max 32 char message in hex
        uint256 timestamp;  //  time of upload in unix
    }

    address private owner;

    uint256 uid;

    mapping(uint256 => Message) Wall;
    
    /*
     * @dev Set first item in Wall mapping when contract is deployed
     */
    constructor () {
        owner = msg.sender;
        uid = 1;
        Wall[uid] = Message(
            0x5468652074756e6e656c20626567696e7320686572652e000000000000000000,
            block.timestamp
        );
    }

}