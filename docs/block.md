# DigiByte Block

A Block instance represents the information of a block in the DigiByte network. Given a hexadecimal string representation of the serialization of a block with its transactions, you can instantiate a Block instance. Methods are provided to calculate and check the merkle root hash (if enough data is provided), but transactions won't necessarily be valid spends, and this class won't validate them. A binary representation as a `Buffer` instance is also valid input for a Block's constructor.

```javascript
// instantiate a new block instance
var block = new Block(hexaEncodedBlock);

// will verify that the corresponding block transactions match the header
assert(block.validMerkleRoot());

// blocks have several properties
assert(block.header); // an instance of block header, more info below
assert(block.transactions); // an array of transactions, more info below
```

## Block Header

Each instance of Block has a BlockHeader _(which can be instantiated separately)_. The header has validation methods, to verify that the block.

```javascript
// will verify that the nonce demonstrates enough proof of work
assert(block.header.validProofOfWork());

// will verify that timestamp is not too far in the future
assert(block.header.validTimestamp());

// each header has the following properties
assert(block.header.version);
assert(block.header.prevHash);
assert(block.header.merkleRoot);
assert(block.header.time);
assert(block.header.bits);
assert(block.header.nonce);
```

## Transactions

```javascript
for (var i in block.transactions) {
  var transaction = block.transactions[i];
}
```
