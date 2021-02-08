// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

contract Tunnelwall {
    
    struct Message {
        bytes32 text;   // max 32 char message in hex
        uint256 timestamp;  //  time of upload in unix
    }

    address private owner;

    mapping(uint256 => Message) Wall;
    
    constructor () {
        owner = msg.sender;
    }

}