const BitIO = require('bit-io');
const Transaction = require('../transaction/transaction');
const AssetEncoder = require('./encoder');
const Price = require('../price');

class AssetTransferor extends AssetEncoder {
    constructor(rules, price) {
        super();
        this.burn = false;

        this.rules = rules;
        this.price = price;
    }
    /**
     * @param {boolean} burn
     */
    burnExtra(burn) {
        this.burn = burn;
        return this;
    }
    verify() {
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
        var output = 0;

        for (var o of this.outputs)
            output += o.amount;

        if (output > input)
            throw "Not enought inputs";
        if (this.burn && input > output)
            throw "Inputs and outputs doesn't match, specify burn transaction";

        var change = 0;
        for (var g of this.gas)
            change += g.satoshis;
            
        change += this.inputs.length * 600;

        change -= this.outputs.length * 600;
        
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
                this.royalties.push({ address, satoshis })
                change -= satoshis;
            }
        }
        
        if (this.storage != null)
            change -= this.storage.satoshis;
            
        change -= this.size();

        if (change < 0)
            throw "Not enought gas, short by " + (-change) + " sats";
        
        this.extra = (change <= 1000) ? change : 0;
        
        this.amountInput = input;
        this.amountOutput = output;
    }
    instructions() {
        if (this.amountInput > this.amountOutput && this.burn == false) {
            if (this.assetChange != null)
                this.outputs.push({ address: this.assetChange, amount: this.amountInput - this.amountOutput });
            else
                throw "No Asset Change address defined";
        }
        this.outputs.sort((x, y) => y.assetAmount - x.assetAmount);

        var data = new BitIO();
        if (this.burn)
            data.appendHex("44410325");
        else
            data.appendHex("44410315");

        var i = 0;
        for (var out of this.outputs) {
            data.appendInt(0, 3);
            data.appendInt(i++, 5);
            data.appendFixedPrecision(out.amount);
        }
        if (this.burn) {
            data.appendInt(0, 3);
            data.appendInt(31, 5);
            data.appendFixedPrecision(this.amountInput - this.amountOutput);
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

        return transaction.serialize(options);
    }

}

module.exports = AssetTransferor;