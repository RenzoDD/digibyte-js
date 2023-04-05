const https = require('https');
const Address = require('../address');

class AssetLookup {

    setKeys(accessKeyId, secretAccessKey) {
        this.#accessKeyId = accessKeyId;
        this.#secretAccessKey = secretAccessKey;
        return this;
    }
    setProvider(url, token = "") {
        this.#provider = url;
        this.#token = token;
        return this;
    }

    /**
     * Get signed url of AWS
     * @param {string} key 
     * @returns {object} - Signed URL
     */
    _getUrl(key) {
        return new Promise((resolve, reject) => {
            if (this.#accessKeyId && this.#accessKeyId)
                resolve(this._signAWS(key));
            else if (this.provider) {
                try {
                    var uri = new URL(this.#provider + key);
                    https.get({
                        host: uri.hostname,
                        path: uri.pathname,
                        port: uri.port,
                        method: 'GET',
                        headers: { token: this.#token }
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
    _signAWS(key) {
        const crypto = require('crypto');

        var HMAC = (secret, data) => {
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(data);
            return hmac.digest();
        }
        var SHA256 = (data) => {
            return crypto.createHash('sha256').update(data).digest('hex');;
        }

        var conf = {
            accessKeyId: this.#accessKeyId,
            secretAccessKey: this.#secretAccessKey,
            signatureVersion: 'v4',
            region: 'ca-central-1'
        };
        var opt = {
            Bucket: 'chaindata-digibyte',
            Key: key,
            Expires: 300,
            RequestPayer: "requester",
        };

        var datetime = new Date().toISOString().substring(0, 19).replace("-", "").replace("-", "").replace(":", "").replace(":", "") + "Z";
        var date = datetime.split("T")[0];

        var canonical = `GET` + `\n` +
            `/${key}` + `\n` +
            `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${conf.accessKeyId}%2F${date}%2F${conf.region}%2Fs3%2Faws4_request&X-Amz-Date=${datetime}&X-Amz-Expires=${opt.Expires}&X-Amz-SignedHeaders=host%3Bx-amz-request-payer&x-amz-request-payer=${opt.RequestPayer}` + `\n` +
            `host:${opt.Bucket}.s3.${conf.region}.amazonaws.com` + `\n` +
            `x-amz-request-payer:${opt.RequestPayer}` + `\n` +
            `\n` +
            `host;x-amz-request-payer` + `\n` +
            `UNSIGNED-PAYLOAD`;

        var to_hash = `AWS4-HMAC-SHA256` + `\n` +
            `${datetime}` + `\n` +
            `${date}/${conf.region}/s3/aws4_request` + `\n` +
            `${SHA256(canonical)}`;

        var kDate = HMAC("AWS4" + conf.secretAccessKey, date);
        var kRegion = HMAC(kDate, conf.region);
        var kService = HMAC(kRegion, "s3");
        var kSigning = HMAC(kService, "aws4_request");
        var signature = HMAC(kSigning, to_hash).toString("hex");

        return `https://${opt.Bucket}.s3.${conf.region}.amazonaws.com/${key}` +
            `?X-Amz-Algorithm=AWS4-HMAC-SHA256` +
            `&X-Amz-Credential=${conf.accessKeyId}%2F${date}%2F${conf.region}%2Fs3%2Faws4_request` +
            `&X-Amz-Date=${datetime}` +
            `&X-Amz-Expires=${opt.Expires}` +
            `&X-Amz-Signature=${signature}` +
            `&X-Amz-SignedHeaders=host%3Bx-amz-request-payer` +
            `&x-amz-request-payer=${opt.RequestPayer}`;
    }

    /**
     * Get data from AWS
     * @param {string} data 
     * @returns {object}
     */
    getData(data) {
        return new Promise(async (resolve, reject) => {
            var url = await this._getUrl(data);
            try {
                https.get(url, (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => { data += chunk; });
                    resp.on('end', () => {
                        try {
                            var obj = JSON.parse(data);
                            resolve(obj);
                        } catch {
                            resolve(null);
                        }
                    });
                }).on("error", (err) => { resolve(null); });
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
        if (!Address.isValid(address))
            throw "Invalid address";
        return this.getData(address);
    }
    /**
     * Retreive asset information
     * @param {*} assetId - AssetId
     * @returns {object} 
     */
    async getAsset(assetId) {
        if (!/^[LU][ahd][1-9A-HJ-NP-Za-km-z]{36}$/.test(assetId))
            throw "Invalid AssetId";
        return this.getData(assetId);
    }
    /**
     * Retreive last set of rules from an asset
     * @param {*} assetId - AssetId 
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
    async getTX(txid) {
        var tx = await this.getData(txid);
        for (let utxo of tx.vout) {
            utxo.satoshis = parseInt(utxo.value);
            delete utxo.value;
            if (utxo.assets === undefined)
                continue;
            for (let asset of utxo.assets)
                asset.amount = parseInt(asset.amount);
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

        utxo.satoshis = parseInt(utxo.value);
        delete utxo.value;

        if (utxo.assets !== undefined)
            for (let asset of utxo.assets)
                asset.amount = parseInt(asset.amount);

        return utxo;
    }

    #accessKeyId
    #secretAccessKey
    #provider
    #token
}

module.exports = AssetLookup;