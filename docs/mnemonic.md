# BIP39 Mnemonic

Utility class to generate, check and convert to a private key's seed a BIP39 mnemonic phrases.

## Generate a BIP39 mnemonic

You don't neet to instanciate the `BIP39` class to use its methods.

```javascript
// Generate 12-words mnemonic
var mnemonic = BIP39.CreateMnemonic();
var mnemonic = BIP39.CreateMnemonic(12);

// Generate other word-lengths
var mnemonic15 = BIP39.CreateMnemonic(15);
var mnemonic18 = BIP39.CreateMnemonic(18);
var mnemonic24 = BIP39.CreateMnemonic(24);

// Less common word-lengths (not recommended)
var mnemonic3 = BIP39.CreateMnemonic(3);
var mnemonic6 = BIP39.CreateMnemonic(6);
var mnemonic9 = BIP39.CreateMnemonic(9);
```

## Check a mnemonic

Evaluate a string and returns `true` if its a valid BIP39 mnemonic if not, it will return `false`.

```javascript
var mnemonic = 'hockey lumber soda negative link evolve pole retreat sponsor voice hurt feature';

if (BIP39.CheckMnemonic(mnemonic)) {
    // TODO
}
```

## Convert mnemonic to seed

To generate private keys and addresses from a mnemonic is necessary convert it first to a master seed.

```javascript
var mnemonic = 'hockey lumber soda negative link evolve pole retreat sponsor voice hurt feature';

var seed = BIP39.MnemonicToSeed(mnemonic);

// Then folow the BIP32 Hierarchical Deterministic Wallet 
var HD = HDPrivateKey.fromSeed(seed);
var derived = HD.derive("m/44'/20'/0'/0/0");

var address = derived.privateKey.toAddress();
// DJPa3v2MZTGy19e3QmnbkxdML1Y4nNy1eQ
```
