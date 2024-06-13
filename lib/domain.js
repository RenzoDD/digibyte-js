const { get } = require('./util/request');
const Address = require('./address');

function DigiByteDomain(domain) { 
    if (typeof domain !== 'string') throw "A domain is needed";
    this.domain = domain;
}

DigiByteDomain.prototype.toAddress = async function() {
    var result = await DigiByteDomain.DomainToAddress(this.domain);
    if (result.error) throw result.error;
    return new Address(result.address);
}

DigiByteDomain.DomainToAddress = async function(domain) {
    var result = await get(`https://digiassets.info/api/domain/${domain}`);
    return result;
}

module.exports = DigiByteDomain;