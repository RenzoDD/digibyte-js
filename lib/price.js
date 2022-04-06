// Decode function from: https://github.com/digiassetX/digibyte-price-decoder

const ieee754 = require('ieee754');
const publishers = {
    dgb1qunxh378eltj2jrwza5sj9grvu5xud43vqvudwh: ["CAD", "USD", "EUR", "GBP", "AUD", "JPY", "CNY", "TRY", "BRL", "CHF"],
    dgb1qlk3hldeynl3prqw259u8gv0jh7w5nwppxlvt3v: ["BTC", "ETH", "LTC", "DCR", "ZIL", "RVN", "XVG", "RDD", "NXS", "POT"]
}
class Price {
    /**
     *
     * @param {string,string[]} addressOrCoinArray
     * @param hex
     * @return {{}|boolean}
     */
    static Decode(addressOrCoinArray, hex) {
        //get the coin array
        let coinArray;
        switch (typeof addressOrCoinArray) {
            case "string":
                coinArray = publishers[addressOrCoinArray];
                break;

            case "object":
                if (addressOrCoinArray.length <= 10) coinArray = addressOrCoinArray;
        }
        if (coinArray === undefined) return false;

        //handle op_return initial bytes
        if (hex.startsWith("6a4c") && ((hex.length - 6) / 2) % 8 == 0)
            hex = hex.substr(6, hex.length - 6);
            
        //decode the op_return data
        let buf = Buffer.from(hex, 'hex');
        let decode = {};
        let count = buf.length / 8;
        for (let i = 0; i < count; i++) {
            decode[coinArray[i]] = ieee754.read(buf, i * 8, true, 52, 8);
        }
        return decode;
    }
    /**
     * Multiply 2 numbers in satoshis and return the result in satoshis
     * @param {Number} amount - Amount of the currency in satoshis
     * @param {Number} exchange - DGB exchange rate for une currency's unit
     * @return {Number} 
     */
    static Multiply(amount, exchange) {
        amount = Math.ceil(amount);
        exchange = Math.ceil(exchange) / 100000000;
        return Math.ceil(amount * exchange);
    }
}

module.exports = Price;