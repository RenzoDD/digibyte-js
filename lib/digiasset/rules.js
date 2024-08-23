/* -------- Current rules --------
 * changeable   ✓
 * signers
 * royalty      ✓
 * kyc          ✓
 * voting       ✓
 * expiry       ✓
 * deflation    ✓
 */

const Price = require("../price");
const Vote = require("./vote");

function Rules(base = { changeable: false }) {
    if (typeof base == "string")
        base = JSON.parse(base);

    this.changeable = base.changeable;

    if (base.royalty) this.royalty = base.royalty;
    if (base.kyc) this.kyc = base.kyc;
    if (base.voting) this.voting = base.voting;
    if (base.expiry) this.expiry = base.expiry;
    if (base.deflation) this.deflation = base.deflation;
}

/**
 * Set if the rules can be overwritten
 * @param {Boolean} changeable 
 * @returns 
 */
Rules.prototype.setChangeable = function (changeable) {
    this.changeable = changeable;
    return this;
}

/**
 * 
 * @param {string} address 
 * @param {int} amount - In satoshis
 * @param {string} currency
 */
Rules.prototype.addRoyalty = function (address, satoshis, currency = "DGB") {
    if (!this.royalty) this.royalty = { addresses: {} };

    if (currency == "DGB")
        delete this.royalty.units;
    else if (typeof currency == "string") {
        this.royalty.units = { ...Price.publishers.find(x => x.name === currency.toUpperCase()) };
        if (!this.royalty.units.address)
            throw "Currency not supported, you can set your own publisher";
    }
    else if (typeof currency == "object") {
        if (!currency.address)
            throw "You need to set a publisher address";
        if (!currency.index)
            throw "You need to set the index of the currency on the data published";
        if (!currency.name)
            throw "You need to set the currency name";

        this.royalty.units = {
            address: currency.address,
            index: currency.index,
            name: currency.name
        }
    }

    this.royalty.addresses[address] = satoshis;

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

/**
 * Set voting object
 * Note: This will overwrite expiry
 * @param {Vote} vote 
 * @returns 
 */
Rules.prototype.setVoting = function (vote) {
    if (vote.expiry === 0)
        delete this.expiry;
    else if (vote.expiry > 0)
        this.expiry = vote.expiry;
    else
        throw "Expiry can't be a negative value";

    this.voting = {
        options: {},
        restricted: vote.restricted
    };

    for (var n in vote.options)
        this.voting.options[Vote.addresses[n]] = vote.options[n];

    return this;
}

/**
 * Set the expiration height or time of the asset. After this block or time the asset can't be moved
 * height < 1577836800000 <= ms since Jan. 1 1970
 * @param {Number} value
 * @returns 
 */
Rules.prototype.setExpiry = function (value) {
    if (typeof value != 'number' && typeof value != 'bigint')
        value = (new Date(value)).getTime()

    this.expiry = value;

    return this;
}

/**
 * Define how many assets must be burned in each transaction
 * @param {Number} units 
 * @returns 
 */
Rules.prototype.setDeflation = function (units) {
    this.deflation = units;

    return this;
}

module.exports = Rules;