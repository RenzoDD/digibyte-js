// Decode function from: https://github.com/digiassetX/digibyte-price-decoder
const { get } = require('./util/request');
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
    var coinArray = Price.publishers[Price.addresses[type]];
    
    //handle op_return initial bytes
    if (hex.startsWith("6a4c") && ((hex.length - 6) / 2) % 8 == 0)
        hex = hex.substr(6, hex.length - 6);

    //decode the op_return data
    let buf = Buffer.from(hex, 'hex');
    let count = buf.length / 8;
    for (let i = 0; i < count; i++) {
        this[coinArray[i]] = Math.ceil(ieee754.read(buf, i * 8, true, 52, 8));
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

    var index = Price.indexex[currency || "USD"];

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

Price.GetBinanceUSD = async function () {
    var data = await get("https://api.binance.com/api/v3/ticker?symbol=DGBUSDT");
    if (data == null) return null;

    return { change: parseFloat(data.priceChangePercent), price: parseFloat(data.lastPrice) };
}
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

Price.indexex = {
    CAD: 0, USD: 1, EUR: 2, GBP: 3, AUD: 4, JPY: 5, CNY: 6, TRY: 7, BRL: 8, CHF: 9,
    BTC: 0, ETH: 1, LTC: 2, DCR: 3, ZIL: 4, RVN: 5, XVG: 6, RDD: 7, NXS: 8, POT: 9
}
Price.addresses = {
    fiat: "dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh",
    crypto: "dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v"
}
Price.publishers = {
    dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh: ["CAD", "USD", "EUR", "GBP", "AUD", "JPY", "CNY", "TRY", "BRL", "CHF"],
    dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v: ["BTC", "ETH", "LTC", "DCR", "ZIL", "RVN", "XVG", "RDD", "NXS", "POT"]
}

module.exports = Price;