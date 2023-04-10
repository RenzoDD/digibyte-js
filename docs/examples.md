# DigiByteJS Javascript Library examples

## Generate a random address

```javascript
var privateKey = new PrivateKey();

var address = privateKey.toAddress();
```

## Generate a address from a SHA256 hash

```javascript
var value = Buffer.from('correct horse battery staple');
var hash = digibyte.crypto.Hash.sha256(value);
var bn = digibyte.crypto.BN.fromBuffer(hash);

var address = new digibyte.PrivateKey(bn).toAddress();
```

## Import an address via WIF

```javascript
var wif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct';

var address = new PrivateKey(wif).toAddress();
```

## Create a Transaction

```javascript
var privateKey = new PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
var utxo = {
  "txid" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
  "vout" : 0,
  "script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
  "satoshis" : 50000
};

var transaction = new bitcore.Transaction()
  .from(utxo)
  .to('DTcHjD2WnbgDyxdWitFzTLaUUr5oQD974C', 15000)
  .sign(privateKey);
```

## Sign a DigiByte message

```javascript
var privateKey = new PrivateKey('L4V1cLWhZVGVTEHc7tAaWdD61kSn4JJgBTcZL19XHAySd7J4TsLb');
var message = new Message('This is an example of a signed message.');

var signature = message.sign(privateKey);
```

## Verify a Bitcoin message

```javascript
var address = 'DTcHjD2WnbgDyxdWitFzTLaUUr5oQD974C';
var signature = 'Hz7xcTo2Ay7141pQ2qzXDP1GdRx42i44RMNEoeTOzVKvf8UScsiIQE4t8A8fGHs87kbhoZ6oi6ov+cDNYvRx2AA=';

var verified = new Message('This is an example of a signed message.').verify(address, signature);
 ```

## Create an OP RETURN transaction

```javascript
var privateKey = new PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
var utxo = {
  "txid" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
  "vout" : 0,
  "script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
  "satoshis" : 50000
};

var transaction = new bitcore.Transaction()
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

var address = new Address(publicKeys, requiredSignatures);
```

## Spend from a 2-of-2 multisig P2SH address

```javascript
var privateKeys = [
  new PrivateKey('91avARGdfge8E4tZfYLoxeJ5sGBdNJQH4kvjJoQFacbgwmaKkrx'),
  new PrivateKey('91avARGdfge8E4tZfYLoxeJ5sGBdNJQH4kvjJoQFacbgww7vXtT')
];
var publicKeys = privateKeys.map(bitcore.PublicKey);
var address = new Address(publicKeys, 2); // 2 of 2

var utxo = {
  "txid" : "153068cdd81b73ec9d8dcce27f2c77ddda12dee3db424bff5cafdbe9f01c1756",
  "vout" : 0,
  "script" : new Script(address).toHex(),
  "satoshis" : 20000
};

var transaction = new bitcore.Transaction()
    .from(utxo, publicKeys, 2)
    .to('DTcHjD2WnbgDyxdWitFzTLaUUr5oQD974C', 20000)
    .sign(privateKeys);
```
