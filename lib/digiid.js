const Hash = require("./crypto/hash");
const BIP39 = require("./bip39");
const HDPrivateKey = require("./hdprivatekey");
const Message = require("./message");
const PrivateKey = require("./privatekey");

class DigiID {
    constructor(data) {
        if (typeof data != 'string')
            throw 'Invalid type';

        var url = new URL(data);

        if (url.protocol != 'digiid:')
            throw "Unknow protocol";

        this.uri = data;
        this.callback = (url.searchParams.get('u') == '1') ? "http://" : "https://";
        this.callback += url.host + url.pathname;
        this.callback = this.callback.replace("////", "//");

        this.variables = {};
        url.searchParams.forEach( (value, key, parent) => {
            this.variables[key] = value;
        });
    }
    sign(secret, index = 0) {
        var indexBuffer = Buffer.alloc(4);
        indexBuffer.writeUInt32LE(index,0);
        
        var toHash = Buffer.concat([indexBuffer, Buffer.from(this.callback)])
        var hash = Hash.sha256(toHash);

        var A = hash.slice(0, 4).readUInt32LE();
        var B = hash.slice(4, 8).readUInt32LE();
        var C = hash.slice(8, 12).readUInt32LE();
        var D = hash.slice(12, 16).readUInt32LE();

        if (typeof secret == 'string') {
            if (BIP39.CheckMnemonic(secret))
                var hdPrivateKey = HDPrivateKey.fromSeed(BIP39.MnemonicToSeed(secret))
            else if (secret.startsWith('xprv'))
                var hdPrivateKey = HDPrivateKey.fromString(secret);
            else if (PrivateKey.isValid(secret))
                var privateKey = new PrivateKey(secret);
        } else if (secret instanceof HDPrivateKey)
            var hdPrivateKey = new HDPrivateKey(secret);
        else if (secret instanceof PrivateKey)
            var privateKey = new PrivateKey(secret);

        if (!hdPrivateKey && !privateKey)
            throw 'Invalid secret';

        if (hdPrivateKey)
            var privateKey = hdPrivateKey.deriveChild(13, true).deriveChild(A, true).deriveChild(B, true).deriveChild(C, true).deriveChild(D, true).privateKey;

        var address = privateKey.toAddress().toString();
        var signature = new Message(this.uri).sign(privateKey);
        
        return { uri: this.uri, address, signature };
    }
    static verify({uri, address, signature}) {
        return new Message(uri).verify(address, signature);
    }
}

module.exports = DigiID;