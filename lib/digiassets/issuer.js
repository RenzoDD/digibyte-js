const Transaction = require('../transaction/transaction');
const Price = require('../price');
const Script = require('../script/script');
const Base58 = require('../encoding/base58');
const Precision = require('../encoding/precision');

class AssetIssuer {
    /**
     * @param {MetaData} metadata 
     * @param {Rules} rules 
     */
    constructor(metadata, rules) {
        this.#metadata = metadata;
        this.#rules = rules || false;

        this.#gas = [];

        this.#outputs = [];
        this.#royalties = [];
        this.#storage = null;

        this.#gasChange = null;

        this.#amountOutput = 0;
        this.#keys = null;

        var assetId = metadata.data.assetId
        if (!/^[LU][ahd][1-9A-HJ-NP-Za-km-z]{36}$/.test(assetId))
            throw new ExpectedError("Invalid Asset Id");
        this.#locked = assetId[0] === 'L';
        this.#aggregation = { a: 0, h: 1, d: 2 }[assetId[1]];
        this.#divisibility = parseInt(Base58.decode(assetId).toString("hex")[47]);;
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
            this.#gas.push(u);

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
     * @param {int} bytes - Size in bytes of the asset files
     * @param {number} price - Amount of DGB equal to 1 DGB
     */
    setStorage(bytes, price) {
        if (!price.USD)
            throw "The price object must contain fiat currency";

        var cost = Math.ceil(bytes * 0.0000012 * price.USD + 10);

        this.#storage = {
            address: "dgb1qjnzadu643tsfzjqjydnh06s9lgzp3m4sg3j68x", // DigiAssetX nodes
            satoshis: cost
        };

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
        var inputs = this.#gas.length;
        var outputs = this.#outputs.length + this.#royalties.length + 2 + (this.#storage == null ? 0 : 1);
        return inputs * 180 + outputs * 34 + 10 + inputs + 80 + (this.#extraGas || 0);
    }
    #verify() {
        //Check dispersed assets rules
        for (var o of this.#outputs) {
            if ((this.#aggregation === 2) && amount != 1)
                throw "You can't have a >1 output for dispersed assets";

            this.#amountOutput += o.amount;
        }

        // Calculate change
        var change = 0;
        for (var g of this.#gas)
            change += g.satoshis;

        change -= this.#outputs.length * 600;

        for (var r of this.#royalties)
            change -= r.satoshis;

        if (this.#storage)
            change -= this.#storage.satoshis;

        change -= this.#size();

        if (change < 0)
            throw "Not enought gas, short by " + (-change) + " sats";

        // Calculate extra gas
        this.#extraGas = change < 1000 ? change : 0;
    }
    #instructions() {
        this.#outputs.sort((x, y) => y.quantity - x.quantity);

        let ruleBits = new Precision();
        if (this.#rules !== false) {

            // TODO: Signers

            if (this.#rules.royalties !== undefined) {
                this.#royalties = []; // empty royalties
                var addresses = Object.keys(this.#rules.royalties);
                for (var addr of addresses) {
                    this.#royalties.push({
                        address: addr,
                        satoshis: this.#rules.royalties[addr]
                    })
                }

                ruleBits.addHex((this.#rules.currency === undefined) ? "1" : "9");
                if (typeof this.#rules.currency === "string") {
                    let i = Price.indexex[this.#rules.currency] + 128;
                    ruleBits.addInteger(i, 8);
                }
                ruleBits.addPrecision(this.#outputs.length);
                ruleBits.addPrecision(this.#royalties.length);
            }

            // TODO: KYC
            // TODO: Vote & Expires

            if (this.#rules.deflate !== undefined) {
                if (this.#aggregation !== 0)
                    throw new ExpectedError("Deflationary assets must be aggregable");
                if (this.#rules.deflate <= 0)
                    throw new ExpectedError("Deflation amount must be positive number");

                ruleBits.addHex("5");
                ruleBits.addPrecision(this.#rules.deflate);
            }

            // Finish rules
            ruleBits.addHex("f");
            while (ruleBits.length % 8 !== 0)
                ruleBits.addBits("1");

            if (ruleBits.length == 0)
                throw "Set rules to false"
        }

        const issuanceFlags = (this.#divisibility << 5) | (this.#locked ? 16 : 0) | (this.#aggregation << 2);

        let data = new Precision();
        data.addHex("444103");

        if (this.#rules === false)
            data.addHex("01");
        else
            data.addHex((this.#rules.rewritable === true) ? '03' : '04');

        data.addBuffer(this.#metadata.toHash());

        data.addPrecision(this.#amountOutput);

        if (this.#rules !== false)
            data.addBuffer(ruleBits.toBuffer());

        // Encode assets outputs
        var i = 0;
        for (var out of this.#outputs) {
            data.addInteger(0, 3);
            data.addInteger(i++, 5);
            data.addPrecision(out.amount);
        }

        data.addInteger(issuanceFlags, 8);

        if (data.length / 8 > 80)
            throw new ExpectedError("Too many asset outputs");

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
            .from(this.#gas);

        for (var output of this.#outputs)
            transaction.to(output.address, 600)

        for (var royalty of this.#royalties)
            transaction.to(royalty.address, royalty.satoshis)

        transaction.addData(data);

        if (this.#storage != null)
            transaction.to(this.#storage.address, this.#storage.satoshis)

        transaction.change(this.#gasChange)

        transaction.fee(this.#size())
            .sign(this.#keys);

        this.#keys = null;

        this.#transaction = transaction;

        var raw = this.#transaction.serialize(options);
        var txid = transaction.id;

        var utxos = [];
        var n = 0;

        for (var output of this.#outputs)
            utxos.push({
                txid,
                vout: n++,
                satoshis: 600,
                scriptPubKey: Script.fromAddress(output.address).toHex(),
                assetId: this.#metadata.data.assetId,
                metadata: "",
                quantity: output.amount
            });

        for (var royalty of this.#royalties)
            utxos.push({
                txid,
                vout: n++,
                satoshis: royalty.satoshis,
                scriptPubKey: Script.fromAddress(royalty.address).toHex()
            });

        utxos.push({}); n++; // OP_RETURN 

        if (this.#storage != null)
            utxos.push({
                txid,
                vout: n++,
                satoshis: this.#storage.satoshis,
                scriptPubKey: Script.fromAddress(this.#storage.address).toHex()
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
        this.inputs = this.#gas;
        this.outputs = utxos;
        this.fee = this.#size();
        this.raw = raw;

        return this;
    }

    #metadata
    #rules

    #gas

    #outputs
    #royalties
    #storage

    #gasChange

    #amountOutput
    #keys

    #locked
    #aggregation
    #divisibility

    #extraGas
    #transaction
}

module.exports = AssetIssuer;