'use strict';

var digibyte = module.exports;

// crypto
digibyte.crypto = {};
digibyte.crypto.BN = require('./lib/crypto/bn');
digibyte.crypto.ECDSA = require('./lib/crypto/ecdsa');
digibyte.crypto.Hash = require('./lib/crypto/hash');
digibyte.crypto.Random = require('./lib/crypto/random');
digibyte.crypto.Point = require('./lib/crypto/point');
digibyte.crypto.Signature = require('./lib/crypto/signature');

// encoding
digibyte.encoding = {};
digibyte.encoding.Base58 = require('./lib/encoding/base58');
digibyte.encoding.Base58Check = require('./lib/encoding/base58check');
digibyte.encoding.BufferReader = require('./lib/encoding/bufferreader');
digibyte.encoding.BufferWriter = require('./lib/encoding/bufferwriter');
digibyte.encoding.Varint = require('./lib/encoding/varint');
digibyte.encoding.Base32 = require('./lib/encoding/base32');
digibyte.encoding.Precision = require('./lib/encoding/precision');

// utilities
digibyte.util = {};
digibyte.util.buffer = require('./lib/util/buffer');
digibyte.util.js = require('./lib/util/js');
digibyte.util.preconditions = require('./lib/util/preconditions');

// errors thrown by the library
digibyte.errors = require('./lib/errors');

// mnemonic
digibyte.Mnemonic = require('./lib/mnemonic');

// main digibyte library
digibyte.Address = require('./lib/address');
digibyte.Block = require('./lib/block');
digibyte.MerkleBlock = require('./lib/block/merkleblock');
digibyte.BlockHeader = require('./lib/block/blockheader');
digibyte.HDPrivateKey = require('./lib/hdprivatekey.js');
digibyte.HDPublicKey = require('./lib/hdpublickey.js');
digibyte.Message = require('./lib/message');
digibyte.Networks = require('./lib/networks');
digibyte.Opcode = require('./lib/opcode');
digibyte.PrivateKey = require('./lib/privatekey');
digibyte.PublicKey = require('./lib/publickey');
digibyte.Script = require('./lib/script');
digibyte.Transaction = require('./lib/transaction');
digibyte.URI = require('./lib/uri');
digibyte.Unit = require('./lib/unit');

// digibyte ecosystem
digibyte.DigiID = require('./lib/digiid');
digibyte.AssetIssuer = require('./lib/digiasset/issuer');
digibyte.AssetTransferor = require('./lib/digiasset/trasferor');
digibyte.MetaData = require('./lib/digiasset/metadata');
digibyte.Rules = require('./lib/digiasset/rules');
digibyte.Vote = require('./lib/digiasset/vote');

// rpc
digibyte.RPC = require('./lib/rpc');

// digibyte extra
digibyte.Price = require('./lib/price');
digibyte.Blockbook = require('./lib/blockbook');

// dependencies, subject to change
digibyte.deps = {};
digibyte.deps.bnjs = require('bn.js');
digibyte.deps.bs58 = require('bs58');
digibyte.deps.Buffer = Buffer;
digibyte.deps.elliptic = require('elliptic');
digibyte.deps._ = require('lodash');

// Internal usage, exposed for testing/advanced tweaking
digibyte.Transaction.sighash = require('./lib/transaction/sighash');
