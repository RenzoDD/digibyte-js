class Precision {
    constructor() {
        this.#bits = "";
    }

    static precision(value) {
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

    addBits(bits) {
        if (!/^[01]+$/.test(bits))
            throw "Invalid bin strign";

        this.#bits += bits;
        return this;
    }
    addHex(hex) {
        if (!/^[0-9a-fA-F]+$/.test(hex))
            throw "Invalid hex strign";

        for (var char of hex) {
            switch (char) {
                case '0': this.#bits += "0000"; break;
                case '1': this.#bits += "0001"; break;
                case '2': this.#bits += "0010"; break;
                case '3': this.#bits += "0011"; break;
                case '4': this.#bits += "0100"; break;
                case '5': this.#bits += "0101"; break;
                case '6': this.#bits += "0110"; break;
                case '7': this.#bits += "0111"; break;
                case '8': this.#bits += "1000"; break;
                case '9': this.#bits += "1001"; break;
                case 'a': this.#bits += "1010"; break;
                case 'b': this.#bits += "1011"; break;
                case 'c': this.#bits += "1100"; break;
                case 'd': this.#bits += "1101"; break;
                case 'e': this.#bits += "1110"; break;
                case 'f': this.#bits += "1111"; break;
            }
        }
        return this;
    }
    addBuffer(buffer) {
        for (var i = 0; i < buffer.length; i++)
            this.#bits += buffer[i].toString(2).padStart(8, "0");
        return this;
    }
    addInteger(integer, size) {
        if (integer < 0) throw "Invalid positive integer";
        if (integer >= Math.pow(2, size)) throw "Size is too short for integer";
        this.#bits += integer.toString(2).padStart(size, '0');
        return this;
    }
    addPrecision(integer) {
        var bits = Precision.precision(integer);
        this.#bits += bits;
        return this;
    }

    toBuffer() {
        var missing = 8 - this.#bits.length % 8;
        if (missing !== 8) {
            var extra = "";
            while (missing != 0) {
                extra += "0";
                missing--;
            }
            this.#bits = extra + this.#bits;
        }

        var ans = Buffer.alloc(this.#bits.length / 8);
        for (var i = 0; i < ans.length; i++) {
            ans[i] = parseInt(this.#bits.substr(i * 8, 8), 2);
        }
        return ans;
    }

    get length() {
        return this.#bits.length;
    }

    #bits
}

module.exports = Precision;