# Networks

DigiByteJS provides support for the main DigiByte network as well as for `testnet3`, the current test blockchain, and the old mainnet specifications. We encourage the use of `Networks.livenet` and `Networks.testnet` as constants. Note that the library sometimes may check for equality against this object. Please avoid creating a deep copy of this object.

The `Network` namespace has a function, `get(...)` that returns an instance of a `Network` or `undefined`. The only argument to this function is some kind of identifier of the network: either its name, a reference to a Network object, or a number used as a magic constant to identify the network (for example, the value `0` that gives bitcoin addresses the distinctive `'1'` at its beginning on livenet, is a `0x6F` for testnet).

## Regtest

The regtest network is useful for development as it's possible to programmatically and instantly generate blocks for testing. It's currently supported as a variation of testnet.

## Setting the Default Network

Most projects will only need to work with one of the networks. The value of `Networks.defaultNetwork` can be set to `Networks.testnet` if the project will need to only to work on testnet (the default is `Networks.livenet`).

## Network constants

The functionality of testnet and livenet is mostly similar (except for some relaxed block validation rules on testnet). They differ in the constants being used for human representation of base58 encoded strings. These are sometimes referred to as "version" constants.