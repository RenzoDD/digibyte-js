const Transaction = require('../transaction/transaction');
const Price = require('../price');
const Precision = require('../encoding/precision');
const Vote = require('./vote');

/**
 * @param {MetaData} metadata 
 * @param {Rules} rules 
 */
function Issuer(metadata, rules) {
    this._metadata = metadata;
    this._rules = rules || false;

    this._gas = [];

    this._outputs = [];
    this._storage = null;
}

Issuer.prototype = {
    get assetsOut() {
        var amountOut = 0;
        for (var output of this._outputs)
            amountOut += output.count;
        return amountOut;
    },

    get inputs() {
        return this._gas;
    },
    get outputs() {
        var result = [];
        for (var output of this._outputs)
            result += { address: output.address, satoshis: 600 };
        return result;
    },
    get priceOutput() {
        if (!this._rules.currency)
            return [];

        if (!Price.publishers[this._rules.currency.address])
            return [{ address: this._rules.currency.address, satoshis: 600 + this._rules.currency.index }];

        return [];
    },
    get royalties() {
        var result = [];
        var addresses = Object.keys(this._rules.royalties);
        for (var addr of addresses) {
            result.push({
                address: addr,
                satoshis: this._rules.royalties[addr]
            })
        }
        return result;
    },
    get instructions() {
        let ruleBits = new Precision();
        if (this._rules !== false) {

            // TODO: Signers

            if (this._rules.royalties) {
                ruleBits.addHex((this._rules.currency === undefined) ? "1" : "9");
                if (this._rules.currency !== undefined) {
                    if (this._rules.currency.address == Price.addresses.fee)
                        ruleBits.addInteger(this._rules.currency.index + 128, 8);
                    else if (this._rules.currency.address == Price.addresses.crypto)
                        ruleBits.addInteger(this._rules.currency.index + 10 + 128, 8);
                    else
                        ruleBits.addPrecision(this.outputs.length);
                }
                ruleBits.addPrecision(this.outputs.length + this.priceOutput.length);
                ruleBits.addPrecision(this.royalties.length);
            }

            // TODO: KYC

            if (this._rules.vote || this._rules.expires) {
                if (this._rules.rewritable === true)
                    throw "Votes can not be rewritable";

                // expires is really vote with no options so can't do both
                if (this._rules.vote && this._rules.expires)
                    throw "Invalid Rule Detected: can't use both vote and expires";

                if (this._rules.expires)
                    this._rules.vote = { options: [], movable: true, cutoff: BigInt(this._rules.expires) };

                let voteCount = this._rules.vote.options.length;
                if (voteCount > 127)
                    throw "Invalid Rule Detected: To many vote options";

                ruleBits.addHex("4");
                ruleBits.addBits(this._rules.vote.movable ? "1" : "0");
                ruleBits.addInteger(voteCount, 7);
                ruleBits.addPrecision(this._rules.vote.cutoff || 0n);

                if (voteCount > Vote.addresses.length)
                    throw "Invalid Rule Detected: To many vote options";
                ruleBits.addPrecision(0);
            }

            // TODO:  Expires

            if (this._rules.deflate !== undefined) {
                if (this._aggregation !== 0)
                    throw new ExpectedError("Deflationary assets must be aggregable");
                if (this._rules.deflate <= 0)
                    throw new ExpectedError("Deflation amount must be positive number");

                ruleBits.addHex("5");
                ruleBits.addPrecision(this._rules.deflate);
            }

            // Finish rules
            ruleBits.addHex("f");
            while (ruleBits.length % 8 !== 0)
                ruleBits.addBits("1");

            if (ruleBits.length == 0)
                throw "Set rules to false"
        }

        const issuanceFlags = (this._divisibility << 5) | (this._locked ? 16 : 0) | (this._aggregation << 2);

        let data = new Precision();
        data.addHex("444103");

        if (this._rules === false) data.addHex("01");
        else data.addHex((this._rules.rewritable === true) ? '03' : '04');

        data.addBuffer(this._metadata.toHash());
        data.addPrecision(this._amountOutput);

        if (this._rules !== false) data.addBuffer(ruleBits.toBuffer());

        // Encode assets outputs
        var n = 0;
        for (var out of this._outputs) {
            data.addInteger(0, 3);
            data.addInteger(n++, 5);
            data.addPrecision(out.amount);
        }

        data.addInteger(issuanceFlags, 8);

        var result = data.toBuffer();
        if (result.length > 80) throw "To many asset outputs"
        return result;
    },
    get storage() {
        if (isNaN(this._storage)) return [];
        return [{ address: "dgb1qjnzadu643tsfzjqjydnh06s9lgzp3m4sg3j68x", satoshis: this._storage }];
    }
}

/**
 * 
 * @param {Object}  utxo 
 * @param {string}  utxo.txid - Previus Transaction ID
 * @param {string}  utxo.script - Output Script
 * @param {int}     utxo.n - Output vout
 * @param {int}     utxo.satoshis - Output amount
 */
Issuer.prototype.addGas = function (utxo) {
    if (!utxo.length)
        utxo = [utxo];

    for (var u of utxo)
        this._gas.push(u);

    return this;
}
/**
 * 
 * @param {string} address
 * @param {int} amount
 */
Issuer.prototype.addOutput = function (address, count) {
    this._outputs.push({ address, count });

    return this;
}

/**
 * 
 * @param {int} bytes - Size in bytes of the asset files
 * @param {number} price - Amount of satoshis equal to 1 USD
 */
Issuer.prototype.setStorage = function (bytes, price) {
    var exchange = price.USD || price;

    if (isNaN(exchange))
        throw "The price object must contain fiat currency";

    this._storage = Math.ceil(bytes * 0.0000012 * exchange + 10);

    return this;
}

/**
 * Build a Transaction object without setting fees or change address
 * @returns {Transaction}
 */
Issuer.prototype.toTransaction = function () {
    var transaction = new Transaction()
        .from(this.inputs)
        .to(this.outputs)
        .to(this.priceOutput)
        .to(this.royalties)
        .addData(this.instructions)
        .to(this.storage);
    return transaction;
}

module.exports = Issuer;