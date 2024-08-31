// Decode function from: https://github.com/digiassetX/digibyte-price-decoder
const Blockbook = require('./blockbook');
const ieee754 = require('ieee754');


/**
 * How many satoshis are equivalent to 1 unit of currency
 * @param {'fiat'|'crypto'} type 'fiat' or 'crypto'
 * @param hex Hexadecimal data from OP_RETURN output encoding
 * @return {{}|boolean}
 */
function Price(type, hex) {
    if (type != 'fiat' && type != 'crypto') throw "Unsuported type";
    //get the coin array
    var publishers = Price.publishers.filter(x => x.address === Price.addresses[type]);

    //handle op_return initial bytes
    if (hex.startsWith("6a4c") && ((hex.length - 6) / 2) % 8 == 0)
        hex = hex.substr(6, hex.length - 6);

    //decode the op_return data
    let buf = Buffer.from(hex, 'hex');
    let count = buf.length / 8;
    for (let i = 0; i < count; i++) {
        this[publishers[i].name] = Math.ceil(ieee754.read(buf, i * 8, true, 52, 8));
    }
}

Price.prototype.toHex = function () {
    var keys = Object.keys(this);
    var result = new Uint8Array(keys.length * 8);
    for (var i = 0; i < keys.length; i++) {
        ieee754.write(result, this[keys[i]], i * 8, true, 52, 8);
    }
    return Buffer.from(result);
}
Price.prototype.toArray = function () {
    var keys = Object.keys(this);
    var result = [];
    for (var key of keys) {
        var object = { ...Price.publishers.find(x => x.name == key) };
        object.value = this[key];
        result.push(object);
    }
    return result;
}

/**
 * Get only one value from hex data
 * @param {string} hex Hexadecimal data from OP_RETURN output encoding
 * @param {Number} currency - Currency to extract
 * @return {Number} 
 */
Price.DecodeCurrency = function (hex, currency) {
    //handle op_return initial bytes
    if (hex.startsWith("6a4c") && ((hex.length - 6) / 2) % 8 == 0)
        hex = hex.substr(6, hex.length - 6);

    var index = Price.publishers.find(x => x.name == (currency || "USD")).index;

    let buf = Buffer.from(hex, 'hex');
    return Math.ceil(ieee754.read(buf, index * 8, true, 52, 8))
}

/**
 * Multiply 2 numbers in satoshis and return the result in satoshis
 * @param {Number} amount - Amount of the currency in satoshis
 * @param {Number} exchange - DGB equal to one currency's unit
 * @return {Number} 
 */
Price.Multiply = function (amount, exchange) {
    if (typeof amount == "number")
        amount = BigInt(Math.ceil(amount));
    if (typeof amount != "bigint")
        throw "Invalid amount type";

    exchange = BigInt(Math.ceil(exchange));

    return Number(amount * exchange / 100000000n);
}

/**
 * Get USD price from Binance API
 * @param {'com'|'us'} endpoint 'com' or 'us'
 * @return {{change,price}}
 */
Price.GetFromBinance = async function (endpoint = 'com') {
    try {
        var data = await fetch(`https://api.binance.${endpoint}/api/v3/ticker?symbol=DGBUSDT`);
        if (data.status !== 200) return { error: 'Fetch failedfailed' };
        var result = await data.json();
        return { change: parseFloat(result.priceChangePercent), price: parseFloat(result.lastPrice) };
    } catch {
        return { error: "Invalid response" }
    }
}
/**
 * Get price object from blockchain records
 * @param {'fiat'|'crypto'} type 'fiat' or 'crypto'
 * @return {Price}
 */
Price.GetFromBlockchain = async function (type) {
    if (type != 'fiat' && type != 'crypto') throw "Unsuported type";

    var address = Price.addresses[type];
    var blockbook = new Blockbook();

    for (var page = 1; true; page++) {
        var addr = await blockbook.address(address, { page, pageSize: 10, details: 'txs' });
        if (addr.error) return addr;

        do {
            var tx = addr.transactions.shift();
            var vin = tx.vin.find(x => x.isAddress && x.addresses.includes(address));
            if (!vin) break;
            var vout = tx.vout.find(x => x.isAddress == false);
            return new Price(type, vout.hex);
        } while (address.transactions.length != 0);
    }
}

Price.publishers = [
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 0, name: 'CAD' },
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 1, name: 'USD' },
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 2, name: 'EUR' },
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 3, name: 'GBP' },
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 4, name: 'AUD' },
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 5, name: 'JPY' },
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 6, name: 'CNY' },
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 7, name: 'TRY' },
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 8, name: 'BRL' },
    { address: 'dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh', index: 9, name: 'CHF' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 0, name: 'BTC' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 1, name: 'ETH' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 2, name: 'LTC' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 3, name: 'DCR' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 4, name: 'ZIL' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 5, name: 'RVN' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 6, name: 'XVG' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 7, name: 'RDD' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 8, name: 'NXS' },
    { address: 'dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v', index: 9, name: 'POT' }
];
Price.addresses = {
    fiat: "dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh",
    crypto: "dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v"
};

module.exports = Price;