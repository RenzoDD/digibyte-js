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
- [Import an address via WIF](docs/examples.md#import-an-address-via-wif)
- [Create a Transaction](docs/examples.md#create-a-transaction)
- [Sign a DigiByte message](docs/examples.md#sign-a-digibyte-message)
- [Verify a DigiByte message](docs/examples.md#verify-a-digibyte-message)
- [Create an OP RETURN transaction](docs/examples.md#create-an-op-return-transaction)
- [Create a 2-of-3 multisig P2SH address](docs/examples.md#create-a-2-of-3-multisig-p2sh-address)
- [Spend from a 2-of-2 multisig P2SH address](docs/examples.md#spend-from-a-2-of-2-multisig-p2sh-address)

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

DigiByte: D6zEnE3roe234dsK4Y8sqparzUnwRcJhmR

## Developers ✒️

[![GitHub](https://img.shields.io/badge/Follow-RenzoDD-blue?logo=github&style=social)](https://github.com/RenzoDD)

[![GitHub](https://img.shields.io/badge/Follow-bitpay-blue?logo=github&style=social)](https://github.com/bitpay)

## License 📄

Code released under the [MIT License](./LICENSE.md).