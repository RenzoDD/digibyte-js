const BitIO = require('bit-io');
const Transaction = require('../transaction/transaction');
const AssetEncoder = require('./encoder');
const Price = require('../price');
const crypto = require('crypto')

class AssetIssuer extends AssetEncoder {
    constructor(metadata, rules) {
        super();

        this.metadata = metadata;
        this.rules = rules || false;

        this.calculateOptions(metadata.data.assetId);

        this.amountOutput = 0;
    }
    verify() {
        for (var o of this.outputs) {
            if ((this.agregation === 2) && amount != 1)
                throw "You can't have a >1 output for dispersed assets";

            this.amountOutput += o.amount;
        }
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
    serialize(options) {
        this.verify();
        var data = this.instructions();

        var transaction = new Transaction()
            .from(this.gas);

        for (var output of this.outputs) {
            transaction.to(output.address, 600)
        }

        for (var royalty of this.royalties) {
            transaction.to(royalty.address, royalty.satoshis)
        }

        transaction.addData(data);

        if (this.storage != null) {
            transaction.to(storage.address, storage.satoshis)
        }

        transaction.change(this.gasChange)
            .fee(this.size())
            .sign(this.keys);

        this.keys = null;

        return transaction.serialize(options);
    }
}

module.exports = AssetIssuer;