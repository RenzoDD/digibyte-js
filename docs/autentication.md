# Digi-ID Autentication

Represent an instance of a Digi-ID login request and generate a valid response object.

## Create a Digi-ID instance

To create an instance you need the Digi-ID connection string usually provided as a qr code in the website the user wants to login.

```javascript
var digiid = new DigiID('digiid://example.com/callback?x=f3399ac06522aba5');
```

## Create login credentials

To create a valid credential you need one of this objects:

- [Mnemonic phrase](mnemonic.md).
- Serialized Master Private Key (xprv...).
- Instance of a [HDPrivateKey](hierarchical.md).
- Instance of a [PrivateKey](privatekey.md).
- Wallet Import Format private key (WIF).

```javascript
var credentials = digiid.sign('brain symbol...');
var credentials = digiid.sign('xprv...');
var credentials = digiid.sign(hdPrivateKey);
var credentials = digiid.sign(new PrivateKey());
var credentials = digiid.sign('L2HL7PYi...');
```

By default, it will use the index 0 to generate the credentials. To generate a diferent credential for the same website you must use a diferent index.

```javascript
var credentials = digiid.sign('xprv...');    // Index: 0
var credentials = digiid.sign('xprv...', 1); // Index: 1
var credentials = digiid.sign('xprv...', 2); // Index: 2
var credentials = digiid.sign('xprv...', 3); // Index: 3
```

Each index is a diferent identity.

## Verify credentials

To verify a user credential you can use the static method `.verify()`.

```javascript
var credentials = {
  uri: 'digiid://example.com/callback?x=f3399ac06522aba5',
  address: 'DEQXfWcqahwP7wy7btwCAqdQrthrq65FtQ',
  signature: 'H9OhuS2nD4...YlmDHmi4BasySY='
};

if (DigiID.verify(credentials)) {
    // TODO:
}

```