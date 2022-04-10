const BitIO = require('bit-io');
const Transaction = require('../transaction/transaction');
const AssetEncoder = require('./encoder');
const Price = require('../price');

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

            if (typeof exchange != "number" || change == NaN)
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

        for (var o of this.outputs)
            output += o.amount;

        output += this.toBurn;

        if (output > input)
            throw "Not enought inputs: " + output + " > " + input;

        // Calculate extra
        if (input - output > 0) {
            if (this.burn === true)
                this.toBurn += input - output;
            else if (this.assetChange != null)
                this.outputs.push({ address: this.assetChange, amount: (input - output) });
            else
                throw "No Asset Change address defined or set burn extra assets";
        }

        // Calculate change
        var change = 0;
        for (var g of this.gas)
            change += g.satoshis;

        change += this.inputs.length * 600;

        change -= this.outputs.length * 600;

        if (this.storage != null)
            change -= this.storage.satoshis;

        for (var r of this.royalties)
            change -= r.satoshis;

        change -= this.size();

        if (change < 0)
            throw "Not enought gas, short by " + (-change) + " sats";

        // Calculate extra gas
        this.extraGas = change < 1000 ? change : 0;
    }
    instructions() {


        this.outputs.sort((x, y) => y.amount - x.amount);

        var data = new BitIO();
        if (this.toBurn > 0)
            data.appendHex("44410325");
        else
            data.appendHex("44410315");

        var i = 0;
        for (var out of this.outputs) {
            data.appendInt(0, 3);
            data.appendInt(i++, 5);
            data.appendFixedPrecision(out.amount);
        }
        if (this.toBurn > 0) {
            data.appendInt(0, 3);
            data.appendInt(31, 5);
            data.appendFixedPrecision(this.toBurn);
        }

        return data.toBuffer();
    }

    serialize(options) {
        this.verify();
        var data = this.instructions();

        var transaction = new Transaction()
            .from(this.inputs)
            .from(this.gas);

        for (var output of this.outputs)
            transaction.to(output.address, 600)

        transaction.addData(data);

        for (var royalty of this.royalties)
            transaction.to(royalty.address, royalty.satoshis);

        if (this.gasChange)
            transaction.change(this.gasChange);

        transaction.fee(this.size())
            .sign(this.keys);

        this.keys = null;

        return transaction.serialize(options);
    }
}

module.exports = AssetTransferor;