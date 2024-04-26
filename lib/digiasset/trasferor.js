const Transaction = require('../transaction/transaction');
const Precision = require('../encoding/precision');
const Address = require('../address');
const Price = require('../price');

/** 
 * @param {Rules} rules 
 * @param {Price} price 
 */
function Transferor(rules, price) {
    this._rules = rules || {};
    this._price = price || {};

    this._inputs = [];
    this._gas = [];

    this._outputs = [];
    this._assetChange = null;

    this._toBurn = 0;
    this._burnExtra = false;
}

Transferor.prototype = {
    get assetsIn() {
        var assets = {};
        var amountIn = 0;
        for (var input of this._inputs) {
            assets[input.assets[0].assetId] = true;
            amountIn += input.assets[0].count;
        }
        if (Object.keys(assets) > 1)
            throw "This library can't hangle inputs diferent assets";
        return amountIn;
    },
    get assetsOut() {
        var amountOut = 0;
        for (var output of this._outputs)
            amountOut += output.count;
        return amountOut;
    },
    get assetsBurned() {
        if (this._burnExtra) {
            var remaining = this.assetsIn - this.assetsOut;
            return this._toBurn + remaining + Number(this._rules.deflate || 0);
        }
        return this._toBurn + Number(this._rules.deflate || 0);
    },
    get assetsChange() {
        if (this._burnExtra)
            return 0;
        return this.assetsIn - this.assetsOut;
    },

    get inputs() {
        return this._inputs.concat(this._gas);
    },
    get outputs() {
        var result = [];
        for (var output of this._outputs)
            result.push({ address: output.address, satoshis: 600 });

        if (this.assetsChange > 0) {
            if (Address.isValid(this._assetChange))
                result.push({ address: this._assetChange, satoshis: 600 });
            else
                throw "Define change address or burn extra assets";
        } else if (this.assetsChange < 0)
            throw "More assets output than input";

        return result;
    },
    get instructions() {
        var data = new Precision();
        if (this.assetsBurned > 0) data.addHex("44410325");
        else data.addHex("44410315");

        var n = 0;
        for (var output of this._outputs) {
            data.addInteger(0, 3);
            data.addInteger(n++, 5);
            data.addPrecision(output.count);
        }

        if (this.assetsChange > 0) {
            if (Address.isValid(this._assetChange)) {
                data.addInteger(0, 3);
                data.addInteger(n++, 5);
                data.addPrecision(this.assetsChange);
            } else
                throw "Define change address or burn extra assets";
        } else if (this.assetsChange < 0)
            throw "More assets output than input";

        if (n >= 32) throw "To many asset outputs max. 31";

        if (this.assetsBurned > 0) {
            data.addInteger(0, 3);
            data.addInteger(31, 5);
            data.addPrecision(this.assetsBurned);
        }

        var result = data.toBuffer();
        if (result.length > 80) throw "To many asset outputs";
        return result;
    },
    get royalties() {
        var result = [];
        if (this._rules.royalties !== undefined) {
            var exchange = 100000000;
            if (this._rules.currency !== undefined) {
                if (this._rules.currency != "DGB" && !this._price)
                    throw "Must provide a price object";

                if (typeof this._rules.currency == "object")
                    exchange = this._price[this._rules.currency.name];
                else if (typeof this._rules.currency == "string" && this._rules.currency != "DGB")
                    exchange = this._price[this._rules.currency];
            }

            if (typeof exchange != "number" || isNaN(exchange))
                throw "Corrupted price array";

            var addresses = Object.keys(this._rules.royalties);
            for (var address of addresses) {
                var satoshis = Price.Multiply(this._rules.royalties[address], exchange);
                result.push({ address, satoshis });
            }
        }
        return result;
    }
}

/**
 * 
 * @param {Object}  utxo 
 * @param {string}  utxo.txid - Previus Transaction ID
 * @param {int}     utxo.vout - Output vout
 * @param {string}  utxo.address - Output Script
 * @param {int}     utxo.satoshis - Output amount
 * 
 * @param { { assetId, cid, count }[] } utxo.assets - Asset Array
 */
Transferor.prototype.addInputs = function (utxos) {
    if (!utxos.length) utxos = [utxos];

    for (var utxo of utxos) {
        if (utxo.assets) {
            if (utxo.assets.length == 1) this._inputs.push(utxo);
            else if (utxo.assets.length == 0) this._gas.push(utxo);
            else throw "This library can't hangle multi-asset inputs";
        }
        else this._gas.push(utxo);
    }

    return this;
}
/**
 * 
 * @param {string} address
 * @param {int} amount
 */
Transferor.prototype.addOutput = function (address, count) {
    this._outputs.push({ address, count });
    return this;
}

/**
 * 
 * @param {string} address 
 */
Transferor.prototype.setAssetChange = function (address) {
    this._assetChange = address;

    return this;
}

/**
 * Burn certain amount of assets
 * @param {number} amount
 */
Transferor.prototype.burnAssets = function (amount) {
    this._toBurn += amount;
    return this;
}
/**
 * Burn assets not assigned
 * @param {boolean} burn
 */
Transferor.prototype.burnExtra = function (burn) {
    this._burnExtra = burn;
    return this;
}

/**
 * Build a Transaction object without setting fees or change address
 * @returns {Transaction}
 */
Transferor.prototype.toTransaction = function () {
    var transaction = new Transaction()
        .from(this.inputs)
        .to(this.outputs)
        .addData(this.instructions)
        .to(this.royalties);
    return transaction;
}

module.exports = Transferor;