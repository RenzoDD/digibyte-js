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

class Rules {
    constructor(base) {
        if (typeof rewritable == "string")
            base = JSON.parse(base);

        this.rewritable = base.rewritable;
        this.effective = base.effective;

        if (base.signers) this.signers = base.signers;
        if (base.royalties) this.royalties = base.royalties;
        if (base.kyc) this.kyc = base.kyc;
        if (base.vote) this.vote = base.vote;
        if (base.currency) this.currency = base.currency;
        if (base.expires) this.expires = base.expires;
        if (base.deflate) this.deflate = base.deflate;
    }
    setRewritable(rewritable) {
        this.rewritable = rewritable;

        return this;
    }
    /**
     * 
     * @param {string} address 
     * @param {int} amount - In satoshis
     * @param {string} currency
     */
    addRoyalties(address, amount, currency = "DGB") {
        currency = currency.toUpperCase();

        if (currency != "DGB" && !this.currency) {
            if (Price.indexex[currency])
                this.currency = currency
            else
                throw "Royalty currency not supported";
        } else if (this.currency != currency) {
            throw "Only one currency allowed"
        }

        if (!this.royalties)
            this.royalties = {};
        this.royalties[address] = amount;

        return this;
    }
    /**
     * Is required to have a KYC address to hold this asset
     */
    setKyc() {
        this.kyc = true;

        return this;
    }
    /**
     * @param {string[]} countries 
     */
    setKycAllow(countries) {
        this.kyc = {
            allow: countries
        };

        return this;
    }
    /**
     * @param {string[]} countries 
     */
    setKycBan(countries) {
        this.kyc = {
            ban: countries
        };

        return this;
    }

    setExpires(height) {
        this.expires = height;

        return this;
    }

    setDeflate(units) {
        this.deflate = units;

        return this;
    }
}

module.exports = Rules;