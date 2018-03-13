const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain', () => {
    // add bc2 variable to validate chains
    let bc, bc2;

    beforeEach(() => {
        // start with fresh blockchain instance per loop
        bc = new Blockchain();
        bc2 = new Blockchain();
    });

    it('start with genesis block', () => {
        // check if genesis block generated properly
        expect(bc.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block', () => {
        // check if addBlock function works well
        const data = 'foo';
        bc.addBlock(data);

        expect(bc.chain[bc.chain.length-1].data).toEqual(data);
    });

    it('validates a valid chain', () => {
        // add a block to the second blockchain instance
        bc2.addBlock('foo');
        
        // validate the second blockchain instance
        // using the first blockchain instance
        expect(bc.isValidChain(bc2.chain)).toBe(true);
    });

    it('invalidates a chain with a corrupt genesis block', () => {
        bc2.chain[0].data = 'Bad Data';

        expect(bc.isValidChain(bc2.chain)).toBe(false);
    });

    it('invalidates a corrupt chain', ()=>{
        bc2.addBlock('foo');
        // bc2.chain[1] is supposed to be 'foo'
        // but got corrupted because of the below line!
        bc2.chain[1].data = 'Not foo'

        expect(bc.isValidChain(bc2.chain)).toBe(false);
    });

    it('replaces the chain with a valid chain', () => {
        bc2.addBlock('goo');
        bc.replaceChain(bc2.chain);

        expect(bc.chain).toEqual(bc2.chain);
    });

    it('does not replace the chain with one of less than or equal to length', ()=>{
        bc.addBlock('foo');
        bc.replaceChain(bc2.chain); //this should be invalid

        expect(bc.chain).not.toEqual(bc2.chain);
    });
});