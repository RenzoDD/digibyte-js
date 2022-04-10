const AWS = require('aws-sdk');
const https = require('https');

class AssetLookup {

    setKeys(accessKeyId, secretAccessKey) {
        this.s3 = new AWS.S3({
            accessKeyId,
            secretAccessKey,
            signatureVersion: 'v4',
            region: 'ca-central-1'
        });
        return this;
    }
    setProvider(url, token = "") {
        this.provider = url;
        this.token = token;
        return this;
    }

    /**
     * Get signed url of AWS
     * @param {string} key 
     * @returns {object} - Signed URL
     */
    getUrl(key) {
        return new Promise((resolve, reject) => {
            if (this.s3 !== undefined)
                resolve(this.s3.getSignedUrl('getObject', {
                    Bucket: 'chaindata-digibyte',
                    Key: key,
                    Expires: 300,
                    RequestPayer: "requester",
                }))
            else if (this.provider !== undefined) {
                try {
                    var uri = new URL(this.provider + key);
                    https.get({
                        host: uri.hostname,
                        path: uri.pathname,
                        port: uri.port,
                        method: 'GET',
                        headers: { token: this.token }
                    }, (resp) => {
                        let data = '';
                        resp.on('data', (chunk) => { data += chunk; });
                        resp.on('end', () => { resolve(JSON.parse(data)); });
                    }).on("error", (err) => { reject(err.message); });
                } catch {
                    throw "Can't fetch URL from provider"
                }
            }
            else
                throw "No initialized, must provide keys or provider";
        });
    }

    /**
     * Get data from AWS
     * @param {string} data 
     * @returns {object}
     */
    getData(data) {
        return new Promise(async (resolve, reject) => {
            var url = await this.getUrl(data);
            try {
                https.get(url, (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => { data += chunk; });
                    resp.on('end', () => { resolve(JSON.parse(data)); });
                }).on("error", (err) => { reject(err.message); });
            } catch {
                throw "Can't fetch Data from AWS"
            }
        });
    }

    /**
     * Retreive address information
     * @param {string} address - DigiByte address
     * @returns 
     */
    async getAddress(address) {
        return await this.getData(address);
    }
    /**
     * Retreive address information
     * @param {*} assetId -  Asset ID
     * @returns {object} 
     */
    async getAsset(assetId) {
        if (!/^[LU][ahd][1-9A-HJ-NP-Za-km-z]{36}$/.test(assetId))
            throw new ExpectedError("Invalid Asset Id");
        return await this.getData(assetId);
    }
    /**
     * Retreive last set of rules from an asset
     * @param {*} assetId - Asset ID 
     * @returns {object}
     */
    async getRules(assetId) {
        var rules = (await this.getData(assetId)).rules;
        
        if (rules === undefined)
            return undefined;

        var rule = rules.pop();

        if (rule.royalties !== undefined)
            for (let i in rule.royalties)
                rule.royalties[i] = BigInt(rule.royalties[i]);

        if (rule.deflate !== undefined)
            rule.deflate = BigInt(rule.deflate);

        return rule;
    }
    /**
     * Retreive transaction information
     * @param {string} txid - Transaction ID 
     * @returns 
     */
    async getTransaction(txid) {
        var tx = await this.getData(txid);
        for (let utxo of tx.vout) {
            utxo.value = BigInt(utxo.value);
            if (utxo.assets === undefined) continue;
            for (let asset of utxo.assets) asset.amount = BigInt(asset.amount);
        }
        return tx;
    }
    /**
     * Retreive UTXO details
     * @param {string} txid - Transaction ID
     * @param {number} vout - Output number
     * @returns 
     */
    async getUTXO(txid, vout) {
        var utxo = (await this.getData(txid)).vout[vout];
        utxo.txid = txid;
        utxo.vout = vout;

        utxo.value = BigInt(utxo.value);
        if (utxo.assets !== undefined)
            for (let asset of utxo.assets)
                asset.amount = BigInt(asset.amount);

        return utxo;
    }
}

module.exports = AssetLookup;