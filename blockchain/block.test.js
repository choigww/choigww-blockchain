/*
:Robust approach to test project:
Setting up a test environment for the project that
we will test this class as well as any other classes
that we add to the project that we can have nice consistent code.

Another benefit of testing is that it serves as
documentation for how to use these classes and objects

<<prompt command to install test runner>>
npm i jest --save-dev
*/

const Block = require('./block');

/*
describe
first parameter 
- a string that serves as a description for these tests

second parameter 
- callback arrow function containing a series of tests
- that jest will execute once it finds this overall describe block function
*/
describe('Block', () => {
    // declare variables not yet assigned
    // by declaring at the top of the codes,
    // we dont have need to write 'const' to define variables
    let data, lastBlock, block;

    // using special jest function 'beforeEach'
    // beforeEach : run the same code for each of the following unit tests
    beforeEach(() => {
        data = 'bar';
        lastBlock = Block.genesis();
        // local block
        block = Block.mineBlock(lastBlock, data);
    });
    
    // using speical jest function 'it'

    // first test : to check the data is set properly
    // first parameter - a description of what the test is that we're expecting
    it('sets the `data` to match the given input', () => {
        
        // 'expect' takes an object or any other peice of data like a string as input
        // then we can chain methods after the expect function
        // to describe what we expect that and put that data to be
        expect(block.data).toEqual(data);
    });

    // second test : to make sure the last hash is set properly
    it('sets the `lastHash` to match the hash of the last block', () => {
        expect(block.lastHash).toEqual(lastBlock.hash);
    });
})
