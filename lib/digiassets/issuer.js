const BitIO = require('bit-io');
const Transaction = require('../transaction/transaction');
const AssetEncoder = require('./encoder');
const Price = require('../price');
const crypto = require('crypto')
const Script = require('../script/script');

class AssetIssuer extends AssetEncoder {
    constructor(metadata, rules) {
        super();

        this.metadata = metadata;
        this.rules = rules || false;

        this.storage = null;

        this.calculateOptions(metadata.data.assetId);

        this.amountOutput = 0;
    }

    /**
     * 
     * @param {Object}  utxo 
     * @param {string}  utxo.txid - Previus Transaction ID
     * @param {string}  utxo.script - Output Script
     * @param {int}     utxo.n - Output vout
     * @param {int}     utxo.satoshis - Output amount
     */
    addGas(utxo) {
        if (!utxo.length)
            utxo = [utxo];

        for (var u of utxo)
            this.gas.push(u);

        return this;
    }
    setStorage(bytes, price) {
        if (!price.USD)
            throw "The price object must contain fiat currency";

        var cost = Math.ceil(bytes * 0.0000012 * price.USD + 10);

        this.storage = {
            address: "dgb1qjnzadu643tsfzjqjydnh06s9lgzp3m4sg3j68x", // DigiAssetX nodes
            satoshis: cost
        };

        return this;
    }

    size() {
        var inputs = this.gas.length;
        var outputs = this.outputs.length + this.royalties.length + 2 + (this.storage == null ? 0 : 1);
        return inputs * 180 + outputs * 34 + 10 + inputs + 80 + (this.extraGas || 0);
    }

    verify() {
        //Check dispersed assets rules
        for (var o of this.outputs) {
            if ((this.agregation === 2) && amount != 1)
                throw "You can't have a >1 output for dispersed assets";

            this.amountOutput += o.amount;
        }

        // Count asset outputs
        var output = 0;

        this._outputs = [];
        for (var o of this.outputs) {
            this._outputs.push(o);
            output += o.amount;
        }

        this.assetsIssued = output;

        // Calculate change
        var change = 0;
        for (var g of this.gas)
            change += g.satoshis;

        change -= this.outputs.length * 600;

        for (var r of this.royalties)
            change -= r.satoshis;

        if (this.storage)
            change -= this.storage.satoshis;

        change -= this.size();

        if (change < 0)
            throw "Not enought gas, short by " + (-change) + " sats";

        // Calculate extra gas
        this.extraGas = change < 1000 ? change : 0;
    }
    instructions() {
        this.outputs.sort((x, y) => y.assetAmount - x.assetAmount);

        let rulesBinary = new BitIO();
        if (this.rules !== false) {

            // TODO: Signers

            if (this.rules.royalties !== undefined) {
                this.royalties = []; // empty royalties
                var addresses = Object.keys(this.rules.royalties);
                for (var addr of addresses) {
                    this.royalties.push({
                        address: addr,
                        satoshis: this.rules.royalties[addr]
                    })
                }

                rulesBinary.appendHex((this.rules.currency === undefined) ? "1" : "9");
                if (typeof this.rules.currency === "string") {
                    let i = Price.indexex[this.rules.currency] + 128;
                    rulesBinary.appendInt(i, 8);
                }
                rulesBinary.appendFixedPrecision(this.outputs.length);
                rulesBinary.appendFixedPrecision(this.royalties.length);
            }

            // TODO: KYC
            // TODO: Vote & Expires

            if (this.rules.deflate !== undefined) {
                if (this.aggregation !== 0)
                    throw new ExpectedError("Deflationary assets must be aggregable");
                if (this.rules.deflate <= 0)
                    throw new ExpectedError("Deflation amount must be positive number");

                rulesBinary.appendHex("5");
                rulesBinary.appendFixedPrecision(this.rules.deflate);
            }

            // Finish rules
            rulesBinary.appendHex("f");
            while (rulesBinary.length % 8 !== 0)
                rulesBinary.appendBits("1");

            if (rulesBinary.length == 0)
                throw "Set rules to false"
        }

        const issuanceFlags = (this.divisibility << 5) | (this.locked ? 16 : 0) | (this.aggregation << 2);

        let data = new BitIO();
        data.appendHex("444103");

        if (this.rules === false)
            data.appendHex("01");
        else
            data.appendHex((this.rules.rewritable === true) ? '03' : '04');

        data.appendBuffer(this.metadata.toHash());

        data.appendFixedPrecision(this.amountOutput);

        if (this.rules !== false)
            data.appendBuffer(rulesBinary.toBuffer());

        // Encode assets outputs
        var i = 0;
        for (var out of this.outputs) {
            data.appendInt(0, 3);
            data.appendInt(i++, 5);
            data.appendFixedPrecision(out.amount);
        }

        data.appendInt(issuanceFlags, 8);

        if (data.length / 8 > 80)
            throw new ExpectedError("Too many asset outputs");

        return data.toBuffer();
    }
    build(options) {
        this.verify();
        var data = this.instructions();

        var transaction = new Transaction()
            .from(this.gas);

        for (var output of this.outputs)
            transaction.to(output.address, 600)

        for (var royalty of this.royalties)
            transaction.to(royalty.address, royalty.satoshis)

        transaction.addData(data);

        if (this.storage != null)
            transaction.to(this.storage.address, this.storage.satoshis)

        transaction.change(this.gasChange)

        transaction.fee(this.size())
            .sign(this.keys);

        this.keys = null;

        this.transaction = transaction;
        var raw = this.transaction.serialize(options);
        var txid = transaction.id;

        var utxos = [], n = 0;

        for (var output of this._outputs)
            utxos.push({
                txid,
                vout: n++,
                satoshis: 600,
                scriptPubKey: Script.fromAddress(output.address).toHex(),
                isAsset: true,
                assetId: this.metadata.data.assetId,
                metadata: "",
                assetAmount: output.amount
            });

        for (var royalty of this.royalties)
            utxos.push({
                txid,
                vout: n++,
                satoshis: royalty.satoshis,
                scriptPubKey: Script.fromAddress(royalty.address).toHex()
            });

        utxos.push({}); n++; // OP_RETURN 

        if (this.storage != null)
            utxos.push({
                txid,
                vout: n++,
                satoshis: this.storage.satoshis,
                scriptPubKey: Script.fromAddress(this.storage.address).toHex()
            });

        var change = transaction.getChangeOutput()
        if (change)
            utxos.push({
                txid,
                vout: n++,
                satoshis: change._satoshis,
                scriptPubKey: Script.fromAddress(this.gasChange).toHex()
            });

        this._json = {
            txid,
            size: raw.length / 2,
            inputs: this.gas,
            outputs: utxos,
            fee: this.size(),
            raw,
        }

        return this;
    }

    get raw() {
        if (!this.transaction)
            throw "Not yet build!";
        return this._json.raw;
    }

    get txid() {
        if (!this.transaction)
            throw "Not yet build!";
        return this._json.txid;
    }
    get json() {
        if (!this.transaction)
            throw "Not yet build!";
        return this._json;
    }
}

module.exports = AssetIssuer;