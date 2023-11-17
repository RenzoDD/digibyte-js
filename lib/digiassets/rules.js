/* -------- Current rules --------
 * rewritable   ✓
 * signers
 * royalties    ✓
 * kyc          ✓
 * vote
 * expires      ✓
 * currency     ✓
 * deflate      ✓
 */

const Price = require("../price");

function Rules(base = { rewritable: false }) {
    if (typeof base == "string")
        base = JSON.parse(base);

    this.rewritable = base.rewritable;

    if (base.signers) this.signers = base.signers;
    if (base.royalties) this.royalties = base.royalties;
    if (base.kyc) this.kyc = base.kyc;
    if (base.vote) this.vote = base.vote;
    if (base.currency) this.currency = base.currency;
    if (base.expires) this.expires = base.expires;
    if (base.deflate) this.deflate = base.deflate;
}

/**
 * Set if the rules can be overwritten
 * @param {Boolean} rewritable 
 * @returns 
 */
Rules.prototype.setRewritable = function (rewritable) {
    this.rewritable = rewritable;
    return this;
}

/**
 * 
 * @param {string} address 
 * @param {int} amount - In satoshis
 * @param {string} currency
 */
Rules.prototype.addRoyalties = function (address, satoshis, currency = "DGB") {
    if (currency == "DGB")
        delete this.currency;
    else if (typeof currency == "string") {
        currency = currency.toUpperCase();

        if (Price.publishers.dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh.indexOf(currency) != -1)
            var type = 'fiat';
        else if (Price.publishers.dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v.indexOf(currency) != -1)
            var type = 'crypto';
        else
            throw "Currency not supported, you can set your own publisher";

        this.currency = {
            address: Price.addresses[type],
            index: Price.indexex[currency],
            name: currency
        }
    }
    else if (typeof currency == "object") {
        if (!currency.address)
            throw "You need to set a publisher address";
        if (!currency.index)
            throw "You need to set the index of the currency on the data published";
        if (!currency.name)
            throw "You need to set the currency name";

        this.currency = {
            address: currency.address,
            index: currency.index,
            name: currency.name
        }
    }

    if (!this.royalties)
        this.royalties = {};
    this.royalties[address] = satoshis;

    return this;
}

/**
 * Is required to have a KYC address to hold this asset
 */
Rules.prototype.setKyc = function (kyc) {
    this.kyc = kyc;

    return this;
}

/**
 * Set allowed countries. KYC address required
 * @param {string[]} countries 
 * @returns 
 */
Rules.prototype.setKycAllow = function (countries) {
    this.kyc = {
        allow: countries
    };

    return this;
}

/**
 * Set banned countries. KYC address required
 * @param {string[]} countries 
 * @returns 
 */
Rules.prototype.setKycBan = function (countries) {
    this.kyc = {
        ban: countries
    };

    return this;
}

Rules.prototype.setVote = function (vote) {
    this.vote = vote;

    return this;
}

/**
 * Set the expiration height or time of the asset. After this block or time the asset can't be moved
 * height < 1577836800000 <= ms since Jan. 1 1970
 * @param {Number} value
 * @returns 
 */
Rules.prototype.setExpires = function (value) {
    if (typeof value != 'number' && typeof value != 'bigint')
        value = (new Date(value)).getTime()

    this.expires = value;

    return this;
}

/**
 * Define how many assets must be burned in each transaction
 * @param {Number} units 
 * @returns 
 */
Rules.prototype.setDeflate = function (units) {
    this.deflate = units;

    return this;
}

module.exports = Rules;