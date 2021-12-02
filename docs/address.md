# DigiByte Address

Represents a DigiByte address. Addresses are the most popular way to make DigiByte transactions.

## Instantiate an Address

To be able to receive DigiBytes an address is needed, but in order to spend them a private key is necessary. Please take a look at the [`PrivateKey`](privatekey.md) docs for more information about exporting and saving a key.  

```javascript
var privateKey = new PrivateKey();
var address = privateKey.toAddress();
```

You can also instantiate an Address from a String, [PublicKey](publickey.md), or [HDPublicKey](hierarchical.md), in case you are not the owner of the private key.

```javascript
// from a string
var address = Address.fromString('sr386zj9DLtVbN3jqRvDhngAUrz87EsijL');

// a default network address from a public key
var publicKey = new PublicKey(privateKey, 'testnet');
var address = new Address(publicKey, 'testnet');

// alternative interface
var address = Address.fromPublicKey(publicKey, 'testnet');

// a testnet address from a public key
var publicKey = new PublicKey(privateKey);
var address = new Address(publicKey, Networks.testnet);
```

A pay-to-script-hash multisignature Address can be instantiated from an array of [PublicKeys](publickey.md).

```javascript
// a 2-of-3 address from public keys
var p2shAddress = new Address([publicKey1, publicKey2, publicKey3], 2);
```

## Validating an Address

The main use that we expect you'll have for the `Address` class  is validating that an address is a valid one, what type of address it is (you may be interested on knowing if the address is a simple "pay to public key hash" address or a "pay to script hash" address) and what network does the address belong to.

The code to do these validations looks like this:

```javascript
// validate an address
if (Address.isValid(input){
  ...
}

// validate that an input field is a valid testnet address
if (Address.isValid(input, Networks.testnet){
  ...
}

// validate that an input field is a valid livenet pubkeyhash
if (Address.isValid(input, Networks.livenet, Address.PayToPublicKeyHash){
  ...
}

// get the specific validation error that can occurred
var error = Address.getValidationError(input, Networks.testnet);
if (error) {
  // handle the error
}
```