/*
Install crypto-js
npm i crypto-js --save

Block Hashes and SHA-256
* The hash is generated from the timestamp, lastHash, and stored Data
* We will use an algorithm called SHA-256
  * Produces a unique 32-bytes(256 bits) hash value for unique data inputs 
  * One-way hash (only generate hash for block, not able to decrypt)
* Useful for block validation
*/

const SHA256 = require('crypto-js/sha256');

class Block {
    // special function which helps us
    // to find the unique attributes
    // for any instance of this class
    constructor(timestamp, lastHash, hash, data) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
    }

    toString() {
        // limit the length of hash digits
        return `Block -
         Timestamp: ${this.timestamp}
         Last Hash: ${this.lastHash.substring(0, 10)}
         Hash     : ${this.hash.substring(0, 10)}
         Data     : ${this.data}`;
    }

    // By adding static, 
    // we enable ourselves to call this Genesys function
    // without having to make a new instance of the Block instance
    static genesis() {
        // default value for the genesis block
        return new this('Genesis time', '~~~~~', 'fir57-h45h', [])
    }

    static mineBlock(lastBlock, data) {
        const timestamp = Date.now();
        const lastHash = lastBlock.hash;
        const hash = Block.hash(timestamp, lastHash, data);
        
        // create a new block class instance.
        return new this(timestamp, lastHash, hash, data);
    }

    static hash(timestamp, lastHash, data) {
        // input for SHA256() --- unique data
        // combine inputs by using instinct template string
        // return as string representation
        return SHA256(`${timestamp}${lastHash}${data}`).toString();
    }

    static blockhash(block) {
        const { timestamp, lastHash, data} = block;
        return Block.hash(timestamp, lastHash, data);
    }
}

module.exports = Block;