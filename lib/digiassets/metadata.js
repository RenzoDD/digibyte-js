const Base58Check = require("../encoding/base58check");
const crypto = require("crypto");
const Address = require("../address");
const Script = require("../script/script");

function MetaData(data) {
    if (data)
        this.data = (typeof data == "string") ? JSON.parse(data) : data;
    else
        this.data = {};
}

MetaData.prototype.name = function (name) {
    if (typeof name != "string")
        throw "Incorrect type for asset name";

    this.data.assetName = name;
    return this;
}

MetaData.prototype.description = function (description) {
    if (typeof description != "string")
        throw "Incorrect type for asset name";

    this.data.description = description;
    return this;
}

MetaData.prototype.addUrl = function (name, url, mimeType) {
    if (typeof name != "string")
        throw "Incorrect type for url name";
    if (typeof url != "string")
        throw "Incorrect type for url url";
    if (typeof mimeType != "string")
        throw "Incorrect type for url mimeType";

    if (!this.data.urls)
        this.data.urls = [];

    this.data.urls.push({ name, url, mimeType });
    return this;
}

MetaData.prototype.addUrl = function (name, url, mimeType) {
    if (typeof name != "string")
        throw "Incorrect type for url name";
    if (typeof url != "string")
        throw "Incorrect type for url url";
    if (typeof mimeType != "string")
        throw "Incorrect type for url mimeType";

    if (!this.data.urls)
        this.data.urls = [];

    this.data.urls.push({ name, url, mimeType });
    return this;
}

MetaData.prototype.site = function (url, type = "web") {
    if (typeof url != "string")
        throw "Incorrect type for site url";
    if (typeof type != "string")
        throw "Incorrect type for site type";

    this.data.site = { url, type };
    return this;
}

MetaData.prototype.issuer = function (issuer) {
    if (typeof issuer != "string")
        throw "Incorrect type for asset issuer";

    this.data.issuer = issuer;
    return this;
}

/**
 * @param {string} hashData
 * @param {"locked"|"unlocked"} locked
 * @param {"aggregatable"|"hybrid"|"dispersed"} aggregation
 * @param {int} divisibility
 */
MetaData.prototype.assetId = function (hashData, locked, aggregation, divisibility) {
    if (typeof hashData != "string")
        throw "hashData type mismatch";
    if (typeof locked != "string")
        throw "locked type mismatch";
    if (typeof divisibility != "number")
        throw "divisibility type mismatch"

    if (locked == "locked") {
        var test = hashData.split(":");

        if (test.length != 2)
            throw "For locked assets the hashing data must be 'TXID:VOUT' of the first UTXO";

        if (!(test[0].match(/^[a-fA-F0-9]+$/) && test[0].length == 64))
            throw "For locked assets the first part of the hasing data must be the TXID of the first UTXO";
        if (!test[1].match(/^[0-9]*$/))
            throw "For locked assets the second part of the hasing data must be the VOUT of the first UTXO";
    } else if (locked == "unlocked") {
        if (Address.isValid(hashData))
            hashData = Script.fromAddress(hashData).toHex();
        if (!hashData.match(/^[a-fA-F0-9]+$/))
            throw "For unlocked assets hash the ScriptPubKey of the first UTXO";

        hashData = Buffer.from(hashData, "hex");
    } else {
        throw "Define locked or unlocked asset";
    }

    locked = locked === "locked";

    aggregation = (aggregation == "a" || aggregation == "aggregatable") ? 0
        : (aggregation == "h" || aggregation == "hybrid") ? 1
            : (aggregation == "d" || aggregation == "dispersed") ? 2
                : null;

    if (aggregation === null)
        throw "Unknown aggregation";

    const issuanceFlags = (divisibility << 5) | (locked ? 16 : 0) | (aggregation << 2);
    const header = (['2e37', '2e6b', '2e4e', false, '20ce', '2102', '20e4', false])[(issuanceFlags & 0x1c) >>> 2];
    const hash256 = crypto.createHash('sha256').update(hashData).digest();
    const hash160 = crypto.createHash('ripemd160').update(hash256).digest('hex');
    this.data.assetId = Base58Check.encode(Buffer.from(header + hash160 + '000' + divisibility, 'hex'));
    return this;
}

MetaData.prototype.toHash = function (encoding = null) {
    var hash = crypto.createHash('sha256').update(JSON.stringify(this)).digest();
    return (encoding == null) ? hash : hash.toString(encoding);
}

MetaData.prototype.toString = function () {
    return JSON.stringify(this);
}

module.exports = MetaData;