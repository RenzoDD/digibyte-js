const Transaction = require('../transaction/transaction');
const Price = require('../price');
const Script = require('../script/script');
const Precision = require('../encoding/precision');

/** 
 * @param {Rules} rules 
 * @param {Price} price 
 */
function AssetTransferor(rules, price) {
    this._rules = rules || {};
    this._price = price || {};

    this._gas = [];
    this._inputs = [];

    this._outputs = [];
    this._assetChange = null;
    this._toBurn = 0;
    this._burn = false;

    this._royalties = [];
    this._gasChange = null;

    this._keys = null;

    if (this._rules.royalties !== undefined) {
        var exchange = 100000000;
        if (this._rules.currency !== undefined) {
            if (this._rules.currency != "DGB" && !this._price)
                throw "Must provide a price object";

            if (typeof this._rules.currency == "object")
                exchange = this._price[this._rules.currency.name];
            else if (this._rules.currency != "DGB")
                exchange = this._price[this._rules.currency];
        }

        if (typeof exchange != "number" || isNaN(exchange))
            throw "Incorrect price array";

        var addresses = Object.keys(this._rules.royalties);
        for (var address of addresses) {
            var satoshis = Price.Multiply(this._rules.royalties[address], exchange);
            this._addRoyalties(address, satoshis);
        }
    }
    if (this._rules.deflate !== undefined) {
        this._toBurn += Number(this._rules.deflate);
    }
}

/**
 * 
 * @param {Object}  utxo 
 * @param {string}  utxo.txid - Previus Transaction ID
 * @param {string}  utxo.script - Output Script
 * @param {int}     utxo.n - Output vout
 * @param {int}     utxo.satoshis - Output amount
 * 
 * @param {string}  utxo.assetId - Asset ID
 * @param {string}  utxo.metadata - Metadata IPFS CID
 * @param {int}     utxo.quantity - Divisible units
 */
AssetTransferor.prototype.addInput = function (utxo) {
    if (!utxo.length)
        utxo = [utxo];

    for (var u of utxo) {
        if (u.assetId)
            this._inputs.push(u);
        else
            this._gas.push(u);
    }

    return this;
}
/**
 * 
 * @param {string} address
 * @param {int} amount
 */
AssetTransferor.prototype.addOutput = function (address, amount) {
    this._outputs.push({ address, amount });

    return this;
}

/**
 * 
 * @param {string} address 
 */
AssetTransferor.prototype.setAssetChange = function (address) {
    this._assetChange = address;

    return this;
}
/**
 * 
 * @param {string} address 
 */
AssetTransferor.prototype.setGasChange = function (address) {
    this._gasChange = address;
    return this;
}

/**
 * Burn certain amount of assets
 * @param {number} amount
 */
AssetTransferor.prototype.burnAssets = function (amount) {
    this._toBurn += amount;
    return this;
}
/**
 * Burn assets not assigned
 * @param {boolean} burn
 */
AssetTransferor.prototype.burnExtra = function (burn) {
    this._burn = burn;
    return this;
}

/**
 * 
 * @param {Array|string} keys - Private keys
 */
AssetTransferor.prototype.sign = function (keys) {
    this._keys = keys;
    return this;
}
/**
 * 
 * @param {*} options - Serialize options
 * @returns 
 */
AssetTransferor.prototype.build = function (options) {
    var data = this._instructions();

    var transaction = new Transaction()
        .from(this._inputs)
        .from(this._gas);

    for (var output of this.__outputs)
        transaction.to(output.address, 600)

    transaction.addData(data);

    for (var royalty of this._royalties)
        transaction.to(royalty.address, royalty.satoshis);

    if (this._gasChange)
        transaction.change(this._gasChange);

    transaction.fee(this._size())
        .sign(this._keys);

    this._keys = null;

    this._transaction = transaction;
    var raw = this._transaction.serialize(options);
    var txid = transaction.id;

    var utxos = [], n = 0;

    for (var output of this.__outputs)
        utxos.push({
            txid,
            vout: n++,
            satoshis: 600,
            scriptPubKey: Script.fromAddress(output.address).toHex(),
            assetId: this._inputs[0].assetId,
            metadata: this._inputs[0].metadata,
            quantity: output.amount
        });

    utxos.push({
        txid,
        vout: n++,
        satoshis: 0,
        scriptPubKey: "6a" + data.length.toString(16).padStart(2, "0") + data.toString("hex")
    }); // OP_RETURN 

    for (var royalty of this._royalties)
        utxos.push({
            txid,
            vout: n++,
            satoshis: royalty.satoshis,
            scriptPubKey: Script.fromAddress(royalty.address).toHex()
        });

    var change = transaction.getChangeOutput()
    if (change)
        utxos.push({
            txid,
            vout: n++,
            satoshis: change._satoshis,
            scriptPubKey: Script.fromAddress(this._gasChange).toHex()
        });

    this.txid = txid;
    this.size = raw.length / 2;
    this.inputs = this._inputs.concat(this._gas);
    this.outputs = utxos;
    this.fee = this._size();
    this.raw = raw;

    return this;
}

AssetTransferor.prototype._size = function () {
    var inputs = this._gas.length + this._inputs.length;
    var outputs = this._outputs.length + this._royalties.length + 2 + (this._assetChange == null ? 0 : 1);
    return inputs * 180 + outputs * 34 + 10 + inputs + 80 + (this._extraGas || 0);
}
AssetTransferor.prototype._addRoyalties = function (address, satoshis) {
    this._royalties.push({ address, satoshis });
    return this;
}
AssetTransferor.prototype._instructions = function () {
    /* Start verification */

    // Check only one type of asset
    var inputs = {};
    for (var i of this._inputs) {
        if (!inputs[i.assetId + ":" + i.metadata])
            inputs[i.assetId + ":" + i.metadata] = 0;
        inputs[i.assetId + ":" + i.metadata] += i.quantity;
    }

    var inputKeys = Object.keys(inputs);
    if (inputKeys.length < 1)
        throw "No assets on input";
    if (inputKeys.length > 1)
        throw "The library can't handle multiple asset transactions yet";

    var input = inputs[inputKeys[0]];

    // Count asset outputs
    var output = 0;

    this.__outputs = [];
    for (var o of this._outputs) {
        this.__outputs.push(o);
        output += o.amount;
    }

    output += this._toBurn;

    if (output > input)
        throw "Not enought inputs: " + output + " > " + input;

    // Calculate extra
    if (input - output > 0) {
        if (this._burn === true)
            this._toBurn += input - output;
        else if (this._assetChange != null)
            this.__outputs.push({ address: this._assetChange, amount: (input - output) });
        else
            throw "No Asset Change address defined or set burn extra assets";
    }

    // Calculate change
    var change = 0;
    for (var g of this._gas)
        change += g.satoshis;

    change += this._inputs.length * 600;

    change -= this._outputs.length * 600;

    // Calculate royalties
    for (var r of this._royalties) {
        if (this.__outputs.length > 1)
            r.satoshis *= (this.__outputs.length - 1);
        change -= r.satoshis;
    }
    change -= this._size();

    if (change < 0)
        throw "Not enought gas, short by " + (-change) + " sats";

    // Calculate extra gas
    this._extraGas = change < 1000 ? change : 0;

    /* End verification */

    this.__outputs.sort((x, y) => y.amount - x.amount);

    var data = new Precision();
    if (this._toBurn > 0)
        data.addHex("44410325");
    else
        data.addHex("44410315");

    var i = 0;
    for (var out of this.__outputs) {
        data.addInteger(0, 3);
        data.addInteger(i++, 5);
        data.addPrecision(out.amount);
    }
    if (this._toBurn > 0) {
        data.addInteger(0, 3);
        data.addInteger(31, 5);
        data.addPrecision(this._toBurn);
    }

    return data.toBuffer();
}

module.exports = AssetTransferor;