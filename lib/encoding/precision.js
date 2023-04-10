function Precision() {
    this._bits = "";
}

Precision.prototype = {
    get length() {
        return this._bits.length;
    }
}

/**
 * Returns a binary string representation of an integer in Bitcoin's precision encoding.
 * @param {Number} value An integer value
 * @returns 
 */
Precision.precision = function (value) {
    if (
        (typeof value != "bigint") &&
        ((typeof value == "number") && (value !== Math.min(value)))
    ) throw new Error("Invalid Input Type");    //throw error if can't be included
    value = BigInt(value);
    if ((value < 0n) || (value > 18014398509481983n)) throw new Error("Invalid Input Type");    //throw error if can't be included

    //see if can be done as 1 byte
    if (value < 32n) {
        // noinspection JSCheckFunctionSignatures
        return value.toString(2).padStart(8, '0');
    }

    //compute exponent
    let exponent = 0n;
    while (value % 10n === 0n) {
        exponent++;
        value /= 10n;
    }
    if (value > 4398046511103n) {                  //max 0 exponent bits
        value *= 10n ** exponent;
        exponent = 0n;
    } else if ((value > 33554431n) && (exponent > 7n)) {//max 3 exponent bits
        value *= 10n ** (exponent - 7n);
        exponent = 7n;
    }

    //return binary value
    if (value > 4398046511103n) {          //7 bytes
        // noinspection JSCheckFunctionSignatures
        return "11" + value.toString(2).padStart(54, '0');
    } else if (value > 17179869183n) {     //6 bytes
        // noinspection JSCheckFunctionSignatures
        return "101" + value.toString(2).padStart(42, '0') + exponent.toString(2).padStart(3, '0');
    } else if (value > 33554431n) {        //5 bytes
        // noinspection JSCheckFunctionSignatures
        return "100" + value.toString(2).padStart(34, '0') + exponent.toString(2).padStart(3, '0');
    } else if (value > 131071n) {          //4 bytes
        // noinspection JSCheckFunctionSignatures
        return "011" + value.toString(2).padStart(25, '0') + exponent.toString(2).padStart(4, '0');
    } else if (value > 511n) {             //3 bytes
        // noinspection JSCheckFunctionSignatures
        return "010" + value.toString(2).padStart(17, '0') + exponent.toString(2).padStart(4, '0');
    } else {                            //2 bytes
        // noinspection JSCheckFunctionSignatures
        return "001" + value.toString(2).padStart(9, '0') + exponent.toString(2).padStart(4, '0');
    }
}

/**
 * Appends a binary string to the buffer data
 * @param {string} bits Binary string of data
 * @returns 
 */
Precision.prototype.addBits = function (bits) {
    if (!/^[01]+$/.test(bits))
        throw "Invalid bin strign";

    this._bits += bits;
    return this;
}
/**
 * Appends a hexadecimal string to the buffer data
 * @param {string} hex Hexadecimal string of data
 * @returns 
 */
Precision.prototype.addHex = function (hex) {
    if (!/^[0-9a-fA-F]+$/.test(hex))
        throw "Invalid hex strign";

    for (var char of hex) {
        switch (char) {
            case '0': this._bits += "0000"; break;
            case '1': this._bits += "0001"; break;
            case '2': this._bits += "0010"; break;
            case '3': this._bits += "0011"; break;
            case '4': this._bits += "0100"; break;
            case '5': this._bits += "0101"; break;
            case '6': this._bits += "0110"; break;
            case '7': this._bits += "0111"; break;
            case '8': this._bits += "1000"; break;
            case '9': this._bits += "1001"; break;
            case 'a': this._bits += "1010"; break;
            case 'b': this._bits += "1011"; break;
            case 'c': this._bits += "1100"; break;
            case 'd': this._bits += "1101"; break;
            case 'e': this._bits += "1110"; break;
            case 'f': this._bits += "1111"; break;
        }
    }
    return this;
}
/**
 * Appends a buffer to the buffer data
 * @param {Buffer} buffer Buffer object of data
 * @returns 
 */
Precision.prototype.addBuffer = function (buffer) {
    for (var i = 0; i < buffer.length; i++)
        this._bits += buffer[i].toString(2).padStart(8, "0");
    return this;
}
/**
 * Appends an integer to the buffer data with the desired size
 * @param {*} integer Integer
 * @param {*} size Size on bits of the integer
 * @returns 
 */
Precision.prototype.addInteger = function (integer, size) {
    if (integer < 0) throw "Invalid positive integer";
    if (integer >= Math.pow(2, size)) throw "Size is too short for integer";
    this._bits += integer.toString(2).padStart(size, '0');
    return this;
}
/**
 * Appends an integer to the buffer data in the Bitcoin's precision encoding
 * @param {Number} integer Integer number
 * @returns 
 */
Precision.prototype.addPrecision = function (integer) {
    var bits = Precision.precision(integer);
    this._bits += bits;
    return this;
}

/**
 * Returns a buffer representation of the data stored in the object
 * @returns {Buffer}
 */
Precision.prototype.toBuffer = function () {
    var missing = 8 - this._bits.length % 8;
    if (missing !== 8) {
        var extra = "";
        while (missing != 0) {
            extra += "0";
            missing--;
        }
        this._bits = extra + this._bits;
    }

    var ans = Buffer.alloc(this._bits.length / 8);
    for (var i = 0; i < ans.length; i++) {
        ans[i] = parseInt(this._bits.substr(i * 8, 8), 2);
    }
    return ans;
}

module.exports = Precision;