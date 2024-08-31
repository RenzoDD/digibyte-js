const Address = require('./address');

function DigiByteDomain(domain) {
    if (typeof domain !== 'string') throw "A domain is needed";
    this.domain = domain;
}

DigiByteDomain.prototype.toAddress = async function () {
    var result = await DigiByteDomain.DomainToAddress(this.domain);
    if (result.error) throw result.error;
    return new Address(result.address);
}

DigiByteDomain.DomainToAddress = async function (domain) {
    try {
        var data = await fetch(`https://digiassets.info/api/domain/${domain}`);
        if (data.status !== 200) return { error: 'Fetch failed' }
        var result = await data.json();
        return result;
    } catch (e) {
        return { error: "Invalid response" };
    }
}

module.exports = DigiByteDomain;