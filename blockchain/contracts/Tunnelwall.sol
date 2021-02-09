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

    /*
     * @dev Append users message to Wall mapping
     * @param _text message from user
     */
    function write(bytes32 _text) public {
        uid++;
        Wall[uid] = Message(
            _text,
            block.timestamp
        );
    }

    /*
     * @dev Read specified item in Wall mapping
     * @param _uid id of message to be read
     * @return Message text and timestamp at specified uid value
     */
    function read(uint256 _uid) view public returns(Message memory) {
        return Wall[_uid];
    }

    /*
     * @dev Read latest item in Wall mapping
     * @return Message text and timestamp at current uid value
     */
    function readLast() view public returns(Message memory) {
        return Wall[uid];
    }

    /*
     * @dev Read current value of uid var
     * @return uid id of latest message
     */
    function getUid() view public returns(uint256) {
        return uid;
    }
}