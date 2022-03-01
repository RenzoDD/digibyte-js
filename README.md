# DigiByte JS

![Licence](https://img.shields.io/npm/l/digibyte-js?style=flat)
[![NPM Package](https://img.shields.io/npm/v/digibyte-js?style=flat)](https://www.npmjs.com/package/digibyte-js)
![Last commit](https://img.shields.io/github/last-commit/RenzoDD/digibyte-js?style=flat)
![Release](https://img.shields.io/github/release-date/RenzoDD/digibyte-js?style=flat)

**A pure and powerful JavaScript DigiByte library** forked from Bitpay's [Bitcore Lib](https://github.com/bitpay/bitcore/tree/master/packages/bitcore-lib) library.

DigiByte is a powerful peer-to-peer platform for the next generation of financial technology. The decentralized nature and the speed of the DigiByte network allows for highly resilient software infrastructure, and the developer community needs reliable, open-source tools to implement DigiByte apps and services.

## Get Started 📦

```sh
npm install digibyte-js
```

## Documentation & Examples 📖

You can find all the documentation [here](https://github.com/RenzoDD/digibyte-js/tree/develop/src/docs)

- [Generate a random address](docs/examples.md#generate-a-random-address)
- [Generate a address from a SHA256 hash](docs/examples.md#generate-a-address-from-a-sha256-hash)
- [Generate a random mnemonic](docs/examples.md#generate-address-from-mnemonic)
- [Import an address via WIF](docs/examples.md#import-an-address-via-wif)
- [Create a Transaction](docs/examples.md#create-a-transaction)
- [Sign a DigiByte message](docs/examples.md#sign-a-digibyte-message)
- [Verify a DigiByte message](docs/examples.md#verify-a-digibyte-message)
- [Create an OP RETURN transaction](docs/examples.md#create-an-op-return-transaction)
- [Create a 2-of-3 multisig P2SH address](docs/examples.md#create-a-2-of-3-multisig-p2sh-address)
- [Spend from a 2-of-2 multisig P2SH address](docs/examples.md#spend-from-a-2-of-2-multisig-p2sh-address)
- [Generate a DigiID login](docs/examples.md#digi-id-autentication)

## Recent Changes 🧙

Last modifications to the packages since v1.2.0

- Sign Digi-ID with specific private key
- Fixed Digi-ID bug on browser
- Start transition from `native` addresses to new name `mulsig`.

## Development 🛠️

```sh
git clone https://github.com/RenzoDD/digibyte-js
cd digibyte-js
npm install
```

## Building the Browser Bundle ✨

To build a digibyte-js full bundle for the browser:

```sh
npm install -g browserify
npm run build
```

This will generate a file named `digibyte.js`.

## Security 🛡️

We're using DigiByte JS in production, as are many others, but please use common sense when doing anything related to finances! We take no responsibility for your implementation decisions.

Projects using DigiByte JS:
* [DigiFaucet](https://www.digifaucet.org/)

If you find any flaw or trouble please submit a new thread on [Github Issues](https://github.com/RenzoDD/digibyte-js/issues)

## Donate 💰

[![Bitcoin - 15uUy4DVhD15Fi5oSS92cQwn5dJUpod1i9](https://img.shields.io/badge/Bitcoin--blue?style=social&logo=bitcoin)](https://bitcoinblockexplorers.com/address/15uUy4DVhD15Fi5oSS92cQwn5dJUpod1i9)
[![Litecoin - LddizHXyCtqHAbwP4dMpQoH5G8kVm2Jx4Y](https://img.shields.io/badge/Litecoin--blue?style=social&logo=litecoin)](https://litecoinblockexplorer.net/address/LddizHXyCtqHAbwP4dMpQoH5G8kVm2Jx4Y)
[![Bitcoin Cash - bitcoincash:qplt3dd2hgg0sj8v4zte9unmvk79nadlkc59vgkgq2](https://img.shields.io/badge/Bitcoin%20Cash--blue?style=social&logo=bitcoincash)](https://bchblockexplorer.com/address/bitcoincash:qplt3dd2hgg0sj8v4zte9unmvk79nadlkc59vgkgq2)
[![Dogecoin - DGZXxRAC57vxs4nnPHD5APbNgpY3LbKS2p](https://img.shields.io/badge/Dogecoin--blue?style=social&logo=dogecoin)](https://dogeblocks.com/address/DGZXxRAC57vxs4nnPHD5APbNgpY3LbKS2p)
[![Dash - XyJLBuWEkkEeDVUquP6iViw47xAECPapLQ](https://img.shields.io/badge/Dash--blue?style=social&logo=dash)](https://dashblockexplorer.com/address/XyJLBuWEkkEeDVUquP6iViw47xAECPapLQ)
[![DigiByte - DCxo6SCKMdyoUpyYydqG3prC3e4NNCy5nG](https://img.shields.io/badge/DigiByte--blue?style=social&logo=bitcoinsv)](https://digibyteblockexplorer.com/address/DCxo6SCKMdyoUpyYydqG3prC3e4NNCy5nG)

## Developers ✒️

[![GitHub](https://img.shields.io/badge/Follow-RenzoDD-blue?logo=github&style=social)](https://github.com/RenzoDD)

[![GitHub](https://img.shields.io/badge/Follow-bitpay-blue?logo=github&style=social)](https://github.com/bitpay)

## License 📄

Code released under the [MIT License](./LICENSE).