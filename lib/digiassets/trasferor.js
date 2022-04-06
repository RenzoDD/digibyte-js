const BitIO = require('bit-io');
const Transaction = require('../transaction/transaction');
const AssetEncoder = require('./encoder');

Transaction

class AssetTransferor extends AssetEncoder {
    constructor() {
        super();
        this.burn = false;
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
        for (var g of this.outputs)
            change += g.satoshis;
        change += this.inputs.length * 600;

        change -= this.outputs.length * 600;
        change -= this.size();

        for (var r of this.royalties)
            change -= r.satoshis;

        if (this.storage != null)
            change -= this.storage.satoshis;

        if (change < 0)
            throw "Not enought gas";

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

        for (var output of this.outputs) {
            transaction.to(output.address, 600)
        }
        
        transaction.addData(data);

        for (var royalty of this.royalties) {
            transaction.to(royalty.address, royalty.satoshis)
        }

        if (this.storage != null) {
            transaction.to(storage.address, storage.satoshis)
        }

        transaction.change(this.gasChange)
            .feePerByte(1)
            .sign(this.keys);

        return transaction.serialize(options);
    }

}

module.exports = AssetTransferor;