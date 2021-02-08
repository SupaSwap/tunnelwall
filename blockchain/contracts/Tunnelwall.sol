// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

contract Tunnelwall {
    
    // bundle uploaded messages with time of upload into specialised datatype
    struct Message {
        bytes32 text;
        uint256 timestamp;
    }

    address private owner;

    mapping(uint256 => Message) Wall;
    
    constructor () {
        owner = msg.sender;
    }

}