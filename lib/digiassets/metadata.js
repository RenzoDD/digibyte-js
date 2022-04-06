const Base58Check = require("../encoding/base58check");
const crypto = require("crypto");

class MetaData {
    constructor() {
        this.data = { };
    }

    name(name) {
        if (typeof name != "string")
            throw "Incorrect type for asset name";

        return this.data.assetName = name;
    }
    description(description) {
        if (typeof description != "string")
            throw "Incorrect type for asset name";

        return this.data.description = description;
    }
    addUrl(name, url, mimeType) {
        if (typeof name != "string")
            throw "Incorrect type for url name";
        if (typeof url != "string")
            throw "Incorrect type for url url";
        if (typeof mimeType != "string")
            throw "Incorrect type for url mimeType";

        if (!this.data.urls)
            this.data.urls = [];
        
            return this.data.urls.push({ name, url, mimeType });
    }
    site(url, type) {
        if (typeof url != "string")
            throw "Incorrect type for site url";
        if (typeof type != "string")
            throw "Incorrect type for site type";

        return this.data.site = { url, type };
    }
    issuer(issuer) {
        if (typeof issuer != "string")
            throw "Incorrect type for asset issuer";

        return this.data.issuer = issuer;
    }

    /**
     * @param {string} hashData
     * @param {boolean} locked
     * @param {"aggregatable"|"hybrid"|"dispersed"} aggregation
     * @param {int} divisibility
     */
    assetId(hashData, locked, aggregation, divisibility) {
        if (typeof hashData != "string")
            throw "hashData type mismatch";
        if (typeof locked != "boolean")
            throw "locked type mismatch";
        if (typeof divisibility != "number")
            throw "divisibility type mismatch"

        aggregation = (aggregation == "a" || aggregation == "aggregatable") ? 0
                    : (aggregation == "h" || aggregation == "hybrid")       ? 1 
                    : (aggregation == "d" || aggregation == "dispersed")    ? 2 
                    : null;

        if (aggregation === null)
            throw "Unknown aggregation";

        const issuanceFlags = (divisibility << 5) | (locked ? 16 : 0) | (aggregation << 2);
        const header = (['2e37', '2e6b', '2e4e', false, '20ce', '2102', '20e4', false])[(issuanceFlags & 0x1c) >>> 2];
        const hash256 = crypto.createHash('sha256').update(hashData).digest();
        const hash160 = crypto.createHash('ripemd160').update(hash256).digest('hex');
        return this.data.assetId = Base58Check.encode(Buffer.from(header + hash160 + '000' + divisibility, 'hex'));
    }

    toHash(encoding = null) {
        var hash = crypto.createHash('sha256').update(JSON.stringify(this)).digest();
        return (encoding == null) ? hash : hash.toString(encoding);
    }
    toString() {
        return JSON.stringify(this);
    }
}

module.exports = MetaData;