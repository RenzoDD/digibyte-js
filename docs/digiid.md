# Digi-ID Autentication

Represent an instance of a Digi-ID login request and can generate a valid response object.

## Create a Digi-ID instance

To create an instance you need the Digi-ID connection string, it is usually provided as a QR code in the website/application the user wants to login.

```javascript
var digiid = new DigiID('digiid://example.com/callback?x=f3399ac06522aba5');
```

## Create login credentials

To create a valid credential you need one of this objects:

- A [Mnemonic phrase](mnemonic.md).
- Serialized Master Private Key (xprv...).
- Instance of a [HDPrivateKey](hierarchical.md).
- Wallet Import Format private key (WIF).
- Instance of a [PrivateKey](privatekey.md).

```javascript
var credentials = digiid.sign('brain symbol...');
var credentials = digiid.sign('xprv...');
var credentials = digiid.sign(hdPrivateKey);
var credentials = digiid.sign('L2HL7PYi...');
var credentials = digiid.sign(new PrivateKey());
```

If you use a mnemonic phrase, xprv or HDPrivateKey by default the library will compute the correct devibation path based on the domain provided on the URI. If a WIF or a PrivateKey is provided the object will sign directly with the secret.

By default, the instance will use the index 0 to generate the credentials. To generate a diferent credential for the same website you must use a diferent index.

```javascript
var credentials = digiid.sign('xprv...');    // Index: 0
var credentials = digiid.sign('xprv...', 1); // Index: 1
var credentials = digiid.sign('xprv...', 2); // Index: 2
var credentials = digiid.sign('xprv...', 3); // Index: 3
```

Each index is a diferent identity.

## Login credentials with DigiAssets

You also can verify the ownership of a DigiAsset holding address providing the address and the private key as two extra arguments

```javascript
var credentials = digiid.sign(privateKey, 0, assetAddress, assetKey);
/*
If the url contains dual signature:
{
  uri: 'digiid://example.com/callback?x=f3399ac06522aba5',
  address: 'DEQXfWcqahwP7wy7btwCAqdQrthrq65FtQ',
  signature: 'H9OhuS2nD4...YlmDHmi4BasySY=',
  assetaddress: 'DQXmzngdtbMLriaBKgrihqptigs7HqwaXu'
  assetsignature: 'IKQdjm8iPfqbNpIz...TnIwS0cQuCo8dhgVRPifE='
}
*/
```

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