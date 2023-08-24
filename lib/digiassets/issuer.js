const Transaction = require('../transaction/transaction');
const Price = require('../price');
const Script = require('../script/script');
const Base58 = require('../encoding/base58');
const Precision = require('../encoding/precision');
const base32 = require('../encoding/base32');
const Vote = require('./vote');

/**
 * @param {MetaData} metadata 
 * @param {Rules} rules 
 */
function AssetIssuer(metadata, rules) {
    this._metadata = metadata;
    this._rules = rules || false;

    this._gas = [];

    this._outputs = [];
    this._royalties = [];
    this._storage = null;

    this._gasChange = null;

    this._amountOutput = 0;
    this._keys = null;

    var assetId = metadata.data.assetId
    if (!/^[LU][ahd][1-9A-HJ-NP-Za-km-z]{36}$/.test(assetId))
        throw new ExpectedError("Invalid Asset Id");
    this._locked = assetId[0] === 'L';
    this._aggregation = { a: 0, h: 1, d: 2 }[assetId[1]];
    this._divisibility = parseInt(Base58.decode(assetId).toString("hex")[47]);;
}

/**
 * 
 * @param {Object}  utxo 
 * @param {string}  utxo.txid - Previus Transaction ID
 * @param {string}  utxo.script - Output Script
 * @param {int}     utxo.n - Output vout
 * @param {int}     utxo.satoshis - Output amount
 */
AssetIssuer.prototype.addGas = function (utxo) {
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
AssetIssuer.prototype.addOutput = function (address, amount) {
    this._outputs.push({ address, amount });

    return this;
}

/**
 * 
 * @param {int} bytes - Size in bytes of the asset files
 * @param {number} price - Amount of DGB equal to 1 DGB
 */
AssetIssuer.prototype.setStorage = function (bytes, price) {
    if (!price.USD)
        throw "The price object must contain fiat currency";

    var cost = Math.ceil(bytes * 0.0000012 * price.USD + 10);

    this._storage = {
        address: "dgb1qjnzadu643tsfzjqjydnh06s9lgzp3m4sg3j68x", // DigiAssetX nodes
        satoshis: cost
    };

    return this;
}
/**
 * 
 * @param {string} address 
 */
AssetIssuer.prototype.setGasChange = function (address) {
    this._gasChange = address;
    return this;
}

/**
 * 
 * @param {Array|string} keys - Private keys
 */
AssetIssuer.prototype.sign = function (keys) {
    this._keys = keys;
    return this;
}
/**
 * 
 * @param {*} options - Serialize options
 * @returns 
 */
AssetIssuer.prototype.build = function (options) {
    /* Start verification */

    //Check dispersed assets rules
    for (var o of this._outputs) {
        if ((this._aggregation === 2) && amount != 1)
            throw "You can't have a >1 output for dispersed assets";

        this._amountOutput += o.amount;
    }

    // Calculate change
    var change = 0;
    for (var g of this._gas)
        change += g.satoshis;

    change -= this._outputs.length * 600;

    for (var r of this._royalties)
        change -= r.satoshis;

    if (this._storage)
        change -= this._storage.satoshis;

    change -= this._size();

    if (change < 0)
        throw "Not enought gas, short by " + (-change) + " sats";

    // Calculate extra gas
    this._extraGas = change < 1000 ? change : 0;

    /* End verification */

    var data = this._instructions();

    var transaction = new Transaction()
        .from(this._gas);

    for (var output of this._outputs)
        transaction.to(output.address, 600)

    for (var royalty of this._royalties)
        transaction.to(royalty.address, royalty.satoshis)

    transaction.addData(data);

    if (this._storage != null)
        transaction.to(this._storage.address, this._storage.satoshis)

    transaction.change(this._gasChange)

    transaction.fee(this._size())
        .sign(this._keys);

    this._keys = null;

    this._transaction = transaction;

    var raw = this._transaction.serialize(options);
    var txid = transaction.id;

    var utxos = [];
    var n = 0;

    var cid = "b" + base32.encode(Buffer.concat([Buffer.from("01551220", "hex"), this._metadata.toHash()]));
    for (var output of this._outputs)
        utxos.push({
            txid,
            vout: n++,
            satoshis: 600,
            scriptPubKey: Script.fromAddress(output.address).toHex(),
            assetId: this._metadata.data.assetId,
            metadata: cid,
            quantity: output.amount
        });

    for (var royalty of this._royalties)
        utxos.push({
            txid,
            vout: n++,
            satoshis: royalty.satoshis,
            scriptPubKey: Script.fromAddress(royalty.address).toHex()
        });

    utxos.push({
        txid,
        vout: n++,
        satoshis: 0,
        scriptPubKey: "6a" + data.length.toString(16).padStart(2, "0") + data.toString("hex")
    }); // OP_RETURN 

    if (this._storage != null)
        utxos.push({
            txid,
            vout: n++,
            satoshis: this._storage.satoshis,
            scriptPubKey: Script.fromAddress(this._storage.address).toHex()
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
    this.inputs = this._gas;
    this.outputs = utxos;
    this.fee = this._size();
    this.raw = raw;

    return this;
}

AssetIssuer.prototype._size = function () {
    var inputs = this._gas.length;
    var outputs = this._outputs.length + this._royalties.length + 2 + (this._storage == null ? 0 : 1);
    return inputs * 180 + outputs * 34 + 10 + inputs + 80 + (this._extraGas || 0);
}
AssetIssuer.prototype._instructions = function () {
    this._outputs.sort((x, y) => y.quantity - x.quantity);

    let ruleBits = new Precision();
    if (this._rules !== false) {

        // TODO: Signers

        if (this._rules.royalties !== undefined) {
            this._royalties = []; // empty royalties
            var addresses = Object.keys(this._rules.royalties);
            for (var addr of addresses) {
                this._royalties.push({
                    address: addr,
                    satoshis: this._rules.royalties[addr]
                })
            }

            ruleBits.addHex((this._rules.currency === undefined) ? "1" : "9");
            if (this._rules.currency !== undefined) {
                if (Price.publishers[this._rules.currency.address]) {
                    let i = this._rules.currency.index;
                    if (this._rules.currency.address == Price.addresses.crypto)
                        i += 10;
                    ruleBits.addInteger(i + 128, 8);
                } else {
                    ruleBits.addPrecision(this._outputs.length);
                    this._outputs.push({ address: this._rules.currency.address, satoshis: 600 + this._rules.currency.index })
                }
            }
            ruleBits.addPrecision(this._outputs.length);
            ruleBits.addPrecision(this._royalties.length);
        }

        // TODO: KYC

        if ((this._rules.vote !== undefined) || (this._rules.expires !== undefined)) {
            // expires is really vote with no options so can't do both
            if (this._rules.rewritable === true)
                throw "Votes can not be rewritable";

            if ((this._rules.vote !== undefined) && (this._rules.expires !== undefined))
                throw "Invalid Rule Detected: can't use both vote and expires";

            if (this._rules.expires !== undefined)
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

    if (this._rules === false)
        data.addHex("01");
    else
        data.addHex((this._rules.rewritable === true) ? '03' : '04');

    data.addBuffer(this._metadata.toHash());

    data.addPrecision(this._amountOutput);

    if (this._rules !== false)
        data.addBuffer(ruleBits.toBuffer());

    // Encode assets outputs
    var i = 0;
    for (var out of this._outputs) {
        data.addInteger(0, 3);
        data.addInteger(i++, 5);
        data.addPrecision(out.amount);
    }

    data.addInteger(issuanceFlags, 8);

    if (data.length / 8 > 80)
        throw new ExpectedError("Too many asset outputs");

    return data.toBuffer();
}

module.exports = AssetIssuer;