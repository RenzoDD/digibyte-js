# DigiByte JS

**A pure and powerful JavaScript DigiByte library** forked from Bitpay's [Bitcore Lib](https://github.com/bitpay/bitcore/tree/master/packages/bitcore-lib) library.

## Principles

DigiByte is a powerful new peer-to-peer platform for the next generation of financial technology. The decentralized nature and the speed of the DigiByte network allows for highly resilient software infrastructure, and the developer community needs reliable, open-source tools to implement DigiByte apps and services.

## Get Started

```sh
npm install digibyte-js
```

## Documentation

You can find all the documentation [here](https://github.com/RenzoDD/digibyte-js/tree/develop/src/docs)

## Examples

- [Generate a random address](docs/examples.md#generate-a-random-address)
- [Generate a address from a SHA256 hash](docs/examples.md#generate-a-address-from-a-sha256-hash)
- [Import an address via WIF](docs/examples.md#import-an-address-via-wif)
- [Create a Transaction](docs/examples.md#create-a-transaction)
- [Sign a Bitcoin message](docs/examples.md#sign-a-bitcoin-message)
- [Verify a Bitcoin message](docs/examples.md#verify-a-bitcoin-message)
- [Create an OP RETURN transaction](docs/examples.md#create-an-op-return-transaction)
- [Create a 2-of-3 multisig P2SH address](docs/examples.md#create-a-2-of-3-multisig-p2sh-address)
- [Spend from a 2-of-2 multisig P2SH address](docs/examples.md#spend-from-a-2-of-2-multisig-p2sh-address)

## Development

```sh
git clone https://github.com/RenzoDD/digibyte-js
cd digibyte-js/src
npm install
```

## Building the Browser Bundle

To build a digibyte-js full bundle for the browser:

```sh
npm install -g browserify
npm run build
```

This will generate a file named `digibyte.js`.

## Security

We're using DigiByte JS in production, as are many others, but please use common sense when doing anything related to finances! We take no responsibility for your implementation decisions.

Projects using DigiByte JS:
* [DigiFaucet](https://www.digifaucet.org/)

## License

Code released under the [MIT License](./LICENSE).

Copyright 2013-2019 BitPay, Inc. Bitcore is a trademark maintained by BitPay, Inc.
