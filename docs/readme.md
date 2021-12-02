# DigiByteJS

## Principles

DigiByte is a powerful peer-to-peer platform for the next generation of financial technology. The decentralized nature and the speed of the DigiByte network allows for highly resilient software infrastructure, and the developer community needs reliable, open-source tools to implement DigiByte apps and services.

To get started, just type `npm install digibyte-js`.

## Documentation Index

### Addresses and Key Management

- [BIP39 Mnemonic](mnemonic.md)
- [Addresses](address.md)
- [Using Different Networks](networks.md)
- [Private Keys](privatekey.md) and [Public Keys](publickey.md)
- [Hierarchically-derived Private and Public Keys](hierarchical.md)

### Payment Handling

- [Using Different Units](unit.md)
- [Acknowledging and Requesting Payments: DigiByte URIs](uri.md)
- [The Transaction Class](transaction.md)

### DigiByte Internals

- [Scripts](script.md)
- [Block](block.md)

### Extra

- [Crypto](crypto.md)
- [Encoding](encoding.md)

## Examples

### Create and Save a Private Key

```javascript
var privateKey = new digibyte.PrivateKey();

var exported = privateKey.toWIF();
// e.g. L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m
var imported = digibyte.PrivateKey.fromWIF(exported);
var hexa = privateKey.toString();
// e.g. 'b9de6e778fe92aa7edb69395556f843f1dce0448350112e14906efc2a80fa61a'
```

### Create an Address

```javascript
var address = privateKey.toAddress();
```

### Create a Multisig Address

```javascript
// Build a 2-of-3 address from public keys
var p2shAddress = new digibyte.Address([publicKey1, publicKey2, publicKey3], 2);
```

### Request a Payment

```javascript
var paymentInfo = {
  address: 'DCxo6SCKMdyoUpyYydqG3prC3e4NNCy5nG',
  amount: 120000 //satoshis
};
var uri = new digibyte.URI(paymentInfo).toString();
```

### Create a Transaction

```javascript
var transaction = new Transaction()
  .from(utxos) // Feed information about what unspent outputs one can use
  .to(address, amount) // Add an output with the given amount of satoshis
  .change(address) // Sets up a change address where the rest of the funds will go
  .sign(privkeySet); // Signs all the inputs it can
```