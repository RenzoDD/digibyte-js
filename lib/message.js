'use strict';

var _ = require('lodash');
var PrivateKey = require('./privatekey');
var PublicKey = require('./publickey');
var Address = require('./address');
var BufferWriter = require('./encoding/bufferwriter');
var ECDSA = require('./crypto/ecdsa');
var Signature = require('./crypto/signature');
var sha256sha256 = require('./crypto/hash').sha256sha256;
var JSUtil = require('./util/js');
var $ = require('./util/preconditions');

function Message(message) {
  if (!(this instanceof Message)) {
    return new Message(message);
  }
  $.checkArgument(_.isString(message), 'First argument should be a string');
  this.message = message;

  return this;
}

Message.MAGIC_BYTES = Buffer.from('DigiByte Signed Message:\n');

Message.prototype.magicHash = function magicHash() {
  var prefix1 = BufferWriter.varintBufNum(Message.MAGIC_BYTES.length);
  var messageBuffer = Buffer.from(this.message);
  var prefix2 = BufferWriter.varintBufNum(messageBuffer.length);
  var buf = Buffer.concat([prefix1, Message.MAGIC_BYTES, prefix2, messageBuffer]);
  var hash = sha256sha256(buf);
  return hash;
};

Message.prototype._sign = function _sign(privateKey) {
  $.checkArgument(privateKey instanceof PrivateKey, 'First argument should be an instance of PrivateKey');
  var hash = this.magicHash();
  var ecdsa = new ECDSA();
  ecdsa.hashbuf = hash;
  ecdsa.privkey = privateKey;
  ecdsa.pubkey = privateKey.toPublicKey();
  ecdsa.signRandomK();
  ecdsa.calci();
  return ecdsa.sig;
};

/**
 * Will sign a message with a given digibyte private key.
 *
 * @param {PrivateKey} privateKey - An instance of PrivateKey
 * @returns {String} A base64 encoded compact signature
 */
Message.prototype.sign = function sign(privateKey) {
  var signature = this._sign(privateKey);
  return signature.toCompact().toString('base64');
};

Message.prototype._verify = function _verify(publicKey, signature) {
  $.checkArgument(publicKey instanceof PublicKey, 'First argument should be an instance of PublicKey');
  $.checkArgument(signature instanceof Signature, 'Second argument should be an instance of Signature');
  var hash = this.magicHash();
  var verified = ECDSA.verify(hash, signature, publicKey);
  if (!verified) {
    this.error = 'The signature was invalid';
  }
  return verified;
};

/**
 * Will return a boolean of the signature is valid for a given digibyte address.
 * If it isn't the specific reason is accessible via the "error" member.
 *
 * @param {Address|String} address - A DigiByte address
 * @param {String} signature - A base64 encoded compact signature
 * @returns {Boolean}
 */
Message.prototype.verify = function verify(address, signature) {
  $.checkArgument(address);
  $.checkArgument(signature && _.isString(signature));

  if (_.isString(address)) {
    address = Address.fromString(address);
  }
  var signature = Signature.fromCompact(Buffer.from(signature, 'base64'));

  // recover the public key
  var ecdsa = new ECDSA();
  ecdsa.hashbuf = this.magicHash();
  ecdsa.sig = signature;
  var publicKey = ecdsa.toPublicKey();

  var signatureAddress = Address.fromPublicKey(publicKey, address.network);

  // check that the recovered address and specified address match
  if (address.toString() !== signatureAddress.toString()) {
    this.error = 'The signature did not match the message digest';
    return false;
  }

  return this._verify(publicKey, signature);
};

/**
 * Will return a public key string if the provided signature and the message digest is correct
 * If it isn't the specific reason is accessible via the "error" member.
 *
 * @param {Address|String} address - A DigiByte address
 * @param {String} signature - A base64 encoded compact signature
 * @returns {String}
 */
Message.prototype.recoverPublicKey = function recoverPublicKey(address, signature) {
  $.checkArgument(address);
  $.checkArgument(signature && _.isString(signature));

  if (_.isString(address)) {
    address = Address.fromString(address);
  }
  var signature = Signature.fromCompact(Buffer.from(signature, 'base64'));

  // recover the public key
  var ecdsa = new ECDSA();
  ecdsa.hashbuf = this.magicHash();
  ecdsa.sig = signature;
  var publicKey = ecdsa.toPublicKey();

  var signatureAddress = Address.fromPublicKey(publicKey, address.network);

  // check that the recovered address and specified address match
  if (address.toString() !== signatureAddress.toString()) {
    this.error = 'The signature did not match the message digest';
  }

  return publicKey.toString();
};

/**
 * Instantiate a message from a message string
 *
 * @param {String} str - A string of the message
 * @returns {Message} A new instance of a Message
 */
Message.fromString = function(str) {
  return new Message(str);
};

/**
 * Instantiate a message from JSON
 *
 * @param {String} json - An JSON string or Object with keys: message
 * @returns {Message} A new instance of a Message
 */
Message.fromJSON = function fromJSON(json) {
  if (JSUtil.isValidJSON(json)) {
    json = JSON.parse(json);
  }
  return new Message(json.message);
};

/**
 * @returns {Object} A plain object with the message information
 */
Message.prototype.toObject = function toObject() {
  return {
    message: this.message
  };
};

/**
 * @returns {String} A JSON representation of the message information
 */
Message.prototype.toJSON = function toJSON() {
  return JSON.stringify(this.toObject());
};

/**
 * Will return a the string representation of the message
 *
 * @returns {String} Message
 */
Message.prototype.toString = function() {
  return this.message;
};

/**
 * Will return a string formatted for the console
 *
 * @returns {String} Message
 */
Message.prototype.inspect = function() {
  return '<Message: ' + this.toString() + '>';
};

module.exports = Message;

var Script = require('./script');
