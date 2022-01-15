# DigiByte examples

## Generate a random address

```javascript
var privateKey = new digibyte.PrivateKey();

// Legacy address 'D...'
var legacy = privateKey.toAddress();
var legacy = privateKey.toAddress('legacy');

// Segwit address 'dgb1...'
var segwit = privateKey.toAddress('segwit');

// Segwit native address 'S...'
var native = privateKey.toAddress('native');
```

## Generate a address from a SHA256 hash

```javascript
var value = Buffer.from('correct horse battery staple');
var hash = digibyte.crypto.Hash.sha256(value);
var bn = digibyte.crypto.BN.fromBuffer(hash);

var address = new digibyte.PrivateKey(bn).toAddress();
```

## Generate address from mnemonic

```javascript
var mnemonic = 'hockey lumber soda negative link evolve pole retreat sponsor voice hurt feature';

var seed = digibyte.BIP39.MnemonicToSeed(mnemonic);

// Then folow the BIP32 Hierarchical Deterministic Wallet 
var HD = digibyte.HDPrivateKey.fromSeed(seed);
var derived = HD.derive("m/44'/20'/0'/0/0");

var address = derived.privateKey.toAddress();
```

## Import an address via WIF

```javascript
var wif = 'L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy';

var address = new digibyte.PrivateKey(wif).toAddress();
```

## Create a Transaction

```javascript
var privateKey = new digibyte.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
var utxo = {
  "txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
  "outputIndex" : 0,
  "address" : "D7SxeTzUMjpwyqrv6iLNvbEiZkK19ANVss",
  "script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
  "satoshis" : 50000
};

var transaction = new digibyte.Transaction()
  .from(utxo)
  .to('D7SxeTzUMjpwyqrv6iLNvbEiZkK19ANVss', 15000)
  .sign(privateKey);
```

## Sign a DigiByte message

```javascript
var privateKey = new digibyte.PrivateKey('L23PpjkBQqpAF4vbMHNfTZAb3KFPBSawQ7KinFTzz7dxq6TZX8UA');
var message = new digibyte.Message('This is an example of a signed message.');

var signature = message.sign(privateKey);
```

## Verify a DigiByte message

```javascript
var address = 'D7SxeTzUMjpwyqrv6iLNvbEiZkK19ANVss';
var signature = 'IO1ssZYzvZOgadCkPKQEIe6ux086r3/llF7Y8gWhxPxTZY7LmrOuSh3NaTttRKfnDovTGvpBnDoeAtJaAi0m5/0=';

var verified = new digibyte.Message('This is an example of a signed message.').verify(address, signature);
 ```

## Create an OP RETURN transaction

```javascript
var privateKey = new digibyte.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
var utxo = {
  "txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
  "outputIndex" : 0,
  "address" : "D7SxeTzUMjpwyqrv6iLNvbEiZkK19ANVss",
  "script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
  "satoshis" : 50000
};

var transaction = new digibyte.Transaction()
    .from(utxo)
    .addData('digibyte rocks') // Add OP_RETURN data
    .sign(privateKey);
```

## Create a 2-of-3 multisig P2SH address

```javascript
var publicKeys = [
  '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
  '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
  '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9'
];
var requiredSignatures = 2;

var address = new digibyte.Address(publicKeys, requiredSignatures);
```

## Spend from a 2-of-2 multisig P2SH address

```javascript
var privateKeys = [
  new digibyte.PrivateKey('L1wFriaUCJ2WpDEJN7iGMqtC4JmfRJCNnuUFjnW1bPtAraehbYdv'),
  new digibyte.PrivateKey('KzJhat1sHE7tyj4L71FCNJ4YzdeUgL4wpP9QH46dh6SA5eFZsLCF')
];
var publicKeys = privateKeys.map(digibyte.PublicKey);
var address = new digibyte.Address(publicKeys, 2); // 2 of 2

var utxo = {
  "txId" : "153068cdd81b73ec9d8dcce27f2c77ddda12dee3db424bff5cafdbe9f01c1756",
  "outputIndex" : 0,
  "address" : address.toString(),
  "script" : new digibyte.Script(address).toHex(),
  "satoshis" : 20000
};

var transaction = new digibyte.Transaction()
    .from(utxo, publicKeys, 2)
    .to('DBDtLkRegz1FGv9b7tXm5NFJr87p8kfMQb', 20000)
    .sign(privateKeys);
```

## Digi-ID Autentication

Following the [DigiID](https://www.digi-id.io/) protocol (from [BitID](https://github.com/bitid/bitid)) you can create a valid credentials to login a website:

```javascript
var digiid = new digibyte.DigiID('digiid://digiassetX.com/?x=a6326ba1330ffe2');
var credentials = digiid.sign('xprv...');

// Post credentials to digiid.callback uri 
```