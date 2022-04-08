const DigiByte = require('../../index');

class AssetEncoder {
    constructor() {
        this.gas = [];
        this.inputs = [];
        this.outputs = [];

        this.royalties = [];

        this.storage = null;

        this.gasChange = null;
        this.assetChange = null;

        this.amountInput = 0;
        this.amountOutput = 0;

        this.keys = null;
    }

    /**
     * 
     * @param {Object}  utxo 
     * @param {string}  utxo.txid - Previus Transaction ID
     * @param {string}  utxo.script - Output Script
     * @param {int}     utxo.n - Output vout
     * @param {int}     utxo.satoshis - Output amount
     * 
     * @param {boolean} utxo.isAsset - Is a DigiAsset
     * @param {string}  utxo.assetId - Asset ID
     * @param {string}  utxo.metadata - Metadata IPFS CID
     * @param {int}     utxo.assetAmount - Divisible units
     */
    addInput(utxo) {
        if (!utxo.length)
            utxo = [utxo];

        for (var u of utxo) {
            if (u.isAsset)
                this.inputs.push(u);
            else
                this.gas.push(u);
        }

        return this;
    }
    /**
     * 
     * @param {string} address
     * @param {int} amount
     */
    addOutput(address, amount) {
        this.outputs.push({ address, amount });

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
    /**
     * 
     * @param {string} address 
     */
    setGasChange(address) {
        this.gasChange = address;
        return this;
    }
    /**
     * 
     * @param {string} address 
     */
    setAssetChange(address) {
        this.assetChange = address;

        return this;
    }
    setStorage(address, satoshis) {
        this.storage = { address, satoshis };
    }
    sign(keys) {
        this.keys = keys;
        return this;
    }

    size() {
        var inputs = this.gas.length + this.inputs.length;
        var outputs = this.outputs.length + this.royalties.length + 2 + (this.assetChange == null ? 0 : 1);
        return inputs * 180 + outputs * 34 + 10 + inputs + 80 + (this.extra || 0);
    }
}

module.exports = AssetEncoder;