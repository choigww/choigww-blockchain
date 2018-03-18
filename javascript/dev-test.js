// explore the Block class!
// '.block' - referencing the local block file
// that we just creted!

const Block = require('./block')


//const block = new Block('foo', 'bar', 'zoo', 'bar');
// string representation
//console.log(block.toString());
//console.log(Block.genesis().toString());

// Given that there is no block created
const fooBlock = Block.mineBlock(Block.genesis(), 'foo');
console.log(fooBlock.toString());
