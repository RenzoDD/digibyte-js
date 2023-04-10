const { get } = require('../util/request');
const Address = require('../address');


function AssetLookup () { }


AssetLookup.prototype.setKeys = function (accessKeyId, secretAccessKey) {
    this._accessKeyId = accessKeyId;
    this._secretAccessKey = secretAccessKey;
    return this;
}

AssetLookup.prototype.setProvider = function (url, token = "") {
    this._provider = url;
    this._token = token;
    return this;
}

AssetLookup.prototype._getUrl = function (key) {
    return new Promise(async (resolve, reject) => {
        if (this._accessKeyId && this._accessKeyId)
            resolve(this._signAWS(key));
        else if (this.provider)
            resolve(await get(this._provider + key, { auth: this._token }));
        else
            throw "No initialized, must provide keys or provider";
    });
}
AssetLookup.prototype._signAWS = function (key) {
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
        accessKeyId: this._accessKeyId,
        secretAccessKey: this._secretAccessKey,
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

AssetLookup.prototype.data = async function (key) {
    var url = await this._getUrl(key);
    var data = await get(url);

    return data;
}
/**
 * Retreive blockhain height
 * @returns {Number}
 */
AssetLookup.prototype.height = async function () {
    return this.data("height");
}
/**
 * Retreive address information
 * @param {string} address - DigiByte address
 * @returns 
 */
AssetLookup.prototype.address = async function (address) {
    if (!Address.isValid(address))
        throw "Invalid address";
    return this.data(address);
}
/**
 * Retreive asset information
 * @param {*} assetId - AssetId
 * @returns {object} 
 */
AssetLookup.prototype.asset = async function (assetId) {
    if (!/^[LU][ahd][1-9A-HJ-NP-Za-km-z]{36}$/.test(assetId))
        throw "Invalid AssetId";
    return this.data(assetId);
}
/**
 * Retreive last set of rules from an asset
 * @param {*} assetId - AssetId 
 * @returns {object}
 */
AssetLookup.prototype.rules = async function (assetId) {
    var asset = await this.data(assetId);
    if (asset == null)
        return asset;

    var rules = asset.rules;

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
AssetLookup.prototype.tx = async function (txid) {
    var tx = await this.data(txid);
    if (tx == null)
        return null;

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
AssetLookup.prototype.utxo = async function (txid, vout) {
    var tx = await this.data(txid);
    if (tx == null)
        return tx;

    utxo = tx.vout[vout];
    utxo.txid = txid;
    utxo.vout = vout;

    utxo.satoshis = parseInt(utxo.value);
    delete utxo.value;

    if (utxo.assets !== undefined)
        for (let asset of utxo.assets)
            asset.amount = parseInt(asset.amount);

    return utxo;
}


module.exports = AssetLookup;