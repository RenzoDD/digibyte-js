const BitIO = require('bit-io');
const Transaction = require('../transaction/transaction');
const AssetEncoder = require('./encoder');
const Price = require('../price');
const Script = require('../script/script');

class AssetTransferor extends AssetEncoder {
    constructor(rules, price) {
        super();
        this.toBurn = 0;
        this.burn = false;

        this.rules = rules;
        this.price = price;


        if (this.rules.royalties !== undefined) {
            var exchange = 100000000;
            if (this.rules.currency !== undefined) {
                if (this.rules.currency != "DGB" && !this.price)
                    throw "Must provide a price object";

                if (typeof this.rules.currency == "object")
                    exchange = this.price[this.rules.currency.name];
                else if (this.rules.currency != "DGB")
                    exchange = this.price[this.rules.currency];
            }

            if (typeof exchange != "number" || exchange == NaN)
                throw "Incorrect price array";

            this.royalties = [];
            var addresses = Object.keys(this.rules.royalties);
            for (var address of addresses) {
                var satoshis = Price.Multiply(this.rules.royalties[address], exchange);
                this.royalties.push({ address, satoshis });
            }
        }
        if (this.rules.deflate !== undefined) {
            this.toBurn += Number(this.rules.deflate);
        }
    }
    /**
     * Burn assets not assigned
     * @param {boolean} burn
     */
    burnExtra(burn) {
        this.burn = burn;
        return this;
    }
    /**
     * Burn certain amount of assets
     * @param {number} amount
     */
    burnAssets(amount) {
        this.toBurn += amount;
        return this;
    }
    /**
     * 
     * @param {string} address 
     * @param {int} amount 
     */
    addRoyalties(address, satoshis) {
        this.royalties.push({ address, satoshis });

        return this;
    }
    
    verify() {
        // Check only one type of asset
        var inputs = {};
        for (var i of this.inputs) {
            if (!inputs[i.assetId + ":" + i.metadata])
                inputs[i.assetId + ":" + i.metadata] = 0;
            inputs[i.assetId + ":" + i.metadata] += i.assetAmount;
        }

        var inputKeys = Object.keys(inputs);
        if (inputKeys.length < 1)
            throw "No assets on input";
        if (inputKeys.length > 1)
            throw "The library can't handle multiple asset transactions yet";

        var input = inputs[inputKeys[0]];

        // Count asset outputs
        var output = 0;

        this._outputs = [];
        for (var o of this.outputs) {
            this._outputs.push(o);
            output += o.amount;
        }

        output += this.toBurn;

        if (output > input)
            throw "Not enought inputs: " + output + " > " + input;

        // Calculate extra
        if (input - output > 0) {
            if (this.burn === true)
                this._toBurn += this.toBurn + input - output;
            else if (this.assetChange != null)
                this._outputs.push({ address: this.assetChange, amount: (input - output) });
            else
                throw "No Asset Change address defined or set burn extra assets";
        }

        // Calculate change
        var change = 0;
        for (var g of this.gas)
            change += g.satoshis;

        change += this.inputs.length * 600;

        change -= this.outputs.length * 600;

        for (var r of this.royalties)
            change -= r.satoshis;

        change -= this.size();

        if (change < 0)
            throw "Not enought gas, short by " + (-change) + " sats";

        // Calculate extra gas
        this.extraGas = change < 1000 ? change : 0;
    }
    instructions() {
        this._outputs.sort((x, y) => y.amount - x.amount);

        var data = new BitIO();
        if (this._toBurn > 0)
            data.appendHex("44410325");
        else
            data.appendHex("44410315");

        var i = 0;
        for (var out of this._outputs) {
            data.appendInt(0, 3);
            data.appendInt(i++, 5);
            data.appendFixedPrecision(out.amount);
        }
        if (this.toBurn > 0) {
            data.appendInt(0, 3);
            data.appendInt(31, 5);
            data.appendFixedPrecision(this._toBurn);
        }

        return data.toBuffer();
    }

    build(options) {
        this.verify();
        var data = this.instructions();

        var transaction = new Transaction()
            .from(this.inputs)
            .from(this.gas);

        for (var output of this._outputs)
            transaction.to(output.address, 600)

        transaction.addData(data);

        for (var royalty of this.royalties)
            transaction.to(royalty.address, royalty.satoshis);

        if (this.gasChange)
            transaction.change(this.gasChange);

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
                assetId: this.inputs[0].assetId,
                metadata: this.inputs[0].metadata,
                assetAmount: output.amount
            });
        n++;
        for (var royalty of this.royalties)
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
                scriptPubKey: Script.fromAddress(this.gasChange).toHex()
            });

        this._json = {
            txid,
            size: raw.length / 2,
            inputs: this.inputs.concat(this.gas),
            outputs: utxos,
            fee: this.size(),
            raw: raw,
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

module.exports = AssetTransferor;