const Block = require('./block');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock(data) {
        // the last value in the chain
        //const lastBlock = this.chain[this.chain.len-1];
        
        const block = Block.mineBlock(this.chain[this.chain.length-1], data);
        this.chain.push(block);

        return block;
    }

    /*
    Function to validate an incoming chain
    and to decide wheter to order/confirm/reject
    */

    
    isValidChain(chain) {
        // If not originated from genesis block, reject
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;
    
        for (let i=1; i<chain.length; i++) {
            const block = chain[i];
            const lastBlock = chain[i-1];

            // The current block's last hash must match the hash of the last block.
            // and the current block hash must match the hash generated from the blockhash function
            if (block.lastHash !== lastBlock.hash ||
                block.hash !== Block.blockhash(block)) {
                return false;
            }
        }
        return true;
    }

    // before you replace the current chain instances with the incoming new chain,
    // we want to make sure it's valid.
    replaceChain(newChain) {
        // is it longer than the current?
        if (newChain.length <= this.chain.length) {
            console.log('Recevied chain is not longer than the current chain.');
            // terminate function returning nothing
            return;
        } else if (!this.isValidChain(newChain)) {
            console.log('The recevied chain is not valid.');
            return;
        }

        console.log('Replacing blockchain with the new chain.');
        this.chain = newChain;
    }
}

module.exports = Blockchain;