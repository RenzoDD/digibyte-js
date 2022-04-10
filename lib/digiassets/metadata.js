const Base58Check = require("../encoding/base58check");
const crypto = require("crypto");

class MetaData {
    constructor(data) {
        if (data)
            this.data = (typeof data == "string") ? JSON.parse(data) : data;
        else
            this.data = { };
    }

    name(name) {
        if (typeof name != "string")
            throw "Incorrect type for asset name";

         this.data.assetName = name;
         return this;
    }
    description(description) {
        if (typeof description != "string")
            throw "Incorrect type for asset name";

        this.data.description = description;
        return this;
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
        
        this.data.urls.push({ name, url, mimeType });
        return this;
    }
    site(url, type) {
        if (typeof url != "string")
            throw "Incorrect type for site url";
        if (typeof type != "string")
            throw "Incorrect type for site type";

        this.data.site = { url, type };
        return this;
    }
    issuer(issuer) {
        if (typeof issuer != "string")
            throw "Incorrect type for asset issuer";

        this.data.issuer = issuer;
        return this;
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
        this.data.assetId = Base58Check.encode(Buffer.from(header + hash160 + '000' + divisibility, 'hex'));
        return this;
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