const DigiByte = require('../../index');
const Base58 = require('../encoding/base58');

class AssetEncoder {
    constructor() {
        this.gas = [];
        this.outputs = [];

        this.royalties = [];

        this.gasChange = null;
        this.assetChange = null;

        this.keys = null;
    }
    calculateOptions(assetId) {
        if (!/^[LU][ahd][1-9A-HJ-NP-Za-km-z]{36}$/.test(assetId))
            throw new ExpectedError("Invalid Asset Id");
        this.locked = assetId[0] === 'L';
        this.aggregation = { a: 0, h: 1, d: 2 }[assetId[1]];
        this.divisibility = parseInt(Base58.decode(assetId).toString("hex")[47]);;
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
    sign(keys) {
        this.keys = keys;
        return this;
    }
}

module.exports = AssetEncoder;