const BitIO = require('bit-io');
const Transaction = require('../transaction/transaction');
const Price = require('../price');
const Script = require('../script/script');
const Address = require('../address');

class AssetTransferor {
    /** 
     * @param {Rules} rules 
     * @param {Price} price 
     */
    constructor(rules, price) {
        this.#rules = rules || {};
        this.#price = price || {};

        this.#gas = [];
        this.#inputs = [];

        this.#outputs = [];
        this.#assetChange = null;
        this.#toBurn = 0;
        this.#burn = false;

        this.#royalties = [];
        this.#gasChange = null;

        this.#keys = null;

        if (this.#rules.royalties !== undefined) {
            var exchange = 100000000;
            if (this.#rules.currency !== undefined) {
                if (this.#rules.currency != "DGB" && !this.#price)
                    throw "Must provide a price object";

                if (typeof this.#rules.currency == "object")
                    exchange = this.#price[this.#rules.currency.name];
                else if (this.#rules.currency != "DGB")
                    exchange = this.#price[this.#rules.currency];
            }

            if (typeof exchange != "number" || isNaN(exchange))
                throw "Incorrect price array";

            var addresses = Object.keys(this.#rules.royalties);
            for (var address of addresses) {
                var satoshis = Price.Multiply(this.#rules.royalties[address], exchange);
                this.#addRoyalties(address, satoshis);
            }
        }
        if (this.#rules.deflate !== undefined) {
            this.#toBurn += Number(this.#rules.deflate);
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
    addInput(utxo) {
        if (!utxo.length)
            utxo = [utxo];

        for (var u of utxo) {
            if (u.assetId)
                this.#inputs.push(u);
            else
                this.#gas.push(u);
        }

        return this;
    }

    /**
     * 
     * @param {string} address
     * @param {int} amount
     */
    addOutput(address, amount) {
        this.#outputs.push({ address, amount });

        return this;
    }
    /**
     * 
     * @param {string} address 
     */
    setAssetChange(address) {
        this.#assetChange = address;

        return this;
    }
    /**
     * Burn certain amount of assets
     * @param {number} amount
     */
    burnAssets(amount) {
        this.#toBurn += amount;
        return this;
    }
    /**
     * Burn assets not assigned
     * @param {boolean} burn
     */
    burnExtra(burn) {
        this.#burn = burn;
        return this;
    }
    /**
     * 
     * @param {string} address 
     * @param {int} amount 
     */
    #addRoyalties(address, satoshis) {
        this.#royalties.push({ address, satoshis });
        return this;
    }
    /**
     * 
     * @param {string} address 
     */
    setGasChange(address) {
        this.#gasChange = address;
        return this;
    }

    /**
     * 
     * @param {Array|string} keys - Private keys
     */
    sign(keys) {
        this.#keys = keys;
        return this;
    }

    #size() {
        var inputs = this.#gas.length + this.#inputs.length;
        var outputs = this.#outputs.length + this.#royalties.length + 2 + (this.#assetChange == null ? 0 : 1);
        return inputs * 180 + outputs * 34 + 10 + inputs + 80 + (this.#extraGas || 0);
    }
    #verify() {
        // Check only one type of asset
        var inputs = {};
        for (var i of this.#inputs) {
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

        this.#_outputs = [];
        for (var o of this.#outputs) {
            this.#_outputs.push(o);
            output += o.amount;
        }

        output += this.#toBurn;

        if (output > input)
            throw "Not enought inputs: " + output + " > " + input;

        // Calculate extra
        if (input - output > 0) {
            if (this.#burn === true)
                this.#toBurn += input - output;
            else if (this.#assetChange != null)
                this.#_outputs.push({ address: this.#assetChange, amount: (input - output) });
            else
                throw "No Asset Change address defined or set burn extra assets";
        }

        // Calculate change
        var change = 0;
        for (var g of this.#gas)
            change += g.satoshis;

        change += this.#inputs.length * 600;

        change -= this.#outputs.length * 600;

        // Calculate royalties
        for (var r of this.#royalties) {
            if (this.#_outputs.length > 1)
                r.satoshis *= (this.#_outputs.length - 1);
            change -= r.satoshis;
        }
        change -= this.#size();

        if (change < 0)
            throw "Not enought gas, short by " + (-change) + " sats";

        // Calculate extra gas
        this.#extraGas = change < 1000 ? change : 0;
    }
    #instructions() {
        this.#_outputs.sort((x, y) => y.amount - x.amount);

        var data = new BitIO();
        if (this.#toBurn > 0)
            data.appendHex("44410325");
        else
            data.appendHex("44410315");

        var i = 0;
        for (var out of this.#_outputs) {
            data.appendInt(0, 3);
            data.appendInt(i++, 5);
            data.appendFixedPrecision(out.amount);
        }
        if (this.#toBurn > 0) {
            data.appendInt(0, 3);
            data.appendInt(31, 5);
            data.appendFixedPrecision(this.#toBurn);
        }

        return data.toBuffer();
    }

    /**
     * 
     * @param {*} options - Serialize options
     * @returns 
     */
    build(options) {
        this.#verify();
        var data = this.#instructions();

        var transaction = new Transaction()
            .from(this.#inputs)
            .from(this.#gas);

        for (var output of this.#_outputs)
            transaction.to(output.address, 600)

        transaction.addData(data);

        for (var royalty of this.#royalties)
            transaction.to(royalty.address, royalty.satoshis);

        if (this.#gasChange)
            transaction.change(this.#gasChange);

        transaction.fee(this.#size())
            .sign(this.#keys);

        this.#keys = null;

        this.#transaction = transaction;
        var raw = this.#transaction.serialize(options);
        var txid = transaction.id;

        var utxos = [], n = 0;

        for (var output of this.#_outputs)
            utxos.push({
                txid,
                vout: n++,
                satoshis: 600,
                scriptPubKey: Script.fromAddress(output.address).toHex(),
                assetId: this.#inputs[0].assetId,
                metadata: this.#inputs[0].metadata,
                quantity: output.amount
            });

        utxos.push({}); n++; // OP_RETURN

        for (var royalty of this.#royalties)
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
                scriptPubKey: Script.fromAddress(this.#gasChange).toHex()
            });

        this.txid = txid;
        this.size = raw.length / 2;
        this.inputs = this.#inputs.concat(this.#gas);
        this.outputs = utxos;
        this.fee = this.#size();
        this.raw = raw;

        return this;
    }

    #rules
    #price

    #gas
    #extraGas
    #inputs

    #outputs
    #_outputs
    #assetChange
    #toBurn
    #burn

    #royalties
    #gasChange

    #keys

    #transaction
}

module.exports = AssetTransferor;