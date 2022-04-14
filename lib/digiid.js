const Hash = require("./crypto/hash");
const BIP39 = require("./bip39");
const HDPrivateKey = require("./hdprivatekey");
const Message = require("./message");
const PrivateKey = require("./privatekey");
const Address = require("./address");

class DigiID {
    constructor(uri) {
        if (typeof uri != 'string')
            throw 'Invalid type';

        if (uri.substr(0, 9) !== 'digiid://')
            throw new Error("Not a DigiID uri");

        let params = {};
        uri.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            params[key] = value;
        });
        
        this.params = params;

        let paramsStart = uri.indexOf("?");

        if (this.params.x === undefined) {
            var x = (new Date()).getTime().toString(16);
            uri += (paramsStart === -1) ? '?x=' + x : '&x=' + x;
        }

        if (this.params.assetId !== undefined) {
            this.asset = {
                id: this.params["assetId"],
                dual: (uri.indexOf("&assetdualsubmit") !== -1)
            };
        } else {
            this.asset = false;
        }

        if (this.params.tos !== undefined) {
            this.contract = Buffer.from(this.params.tos, 'base64');
        } else {
            this.contract = false;
        }

        this.unsafe = this.params.u !== undefined;

        this.uri = uri;
        this.callback = (this.unsafe ? 'http://' : 'https://') + uri.substr(9, (paramsStart === -1) ? undefined : paramsStart - 9);
        this.domain = uri.match(/^digiid\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)[1];
    }
    path(index = 0) {
        var indexBuffer = Buffer.alloc(4);
        indexBuffer.writeUInt32LE(index, 0);

        var toHash = Buffer.concat([indexBuffer, Buffer.from(this.callback)])
        var hash = Hash.sha256(toHash);

        var A = hash.slice(0, 4).readUInt32LE();
        var B = hash.slice(4, 8).readUInt32LE();
        var C = hash.slice(8, 12).readUInt32LE();
        var D = hash.slice(12, 16).readUInt32LE();
        
        A = A >= 0x80000000 ? A - 0x80000000 : A;
        B = B >= 0x80000000 ? B - 0x80000000 : B;
        C = C >= 0x80000000 ? C - 0x80000000 : C;
        D = D >= 0x80000000 ? D - 0x80000000 : D;

        return `m/13'/${A}'/${B}'/${C}'/${D}'`;
    }
    sign(secret, index = 0, assetAddress, assetKey) {
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

        if (hdPrivateKey) {
            var path = this.path(index);
            var privateKey = hdPrivateKey.deriveChild(path).privateKey;
        }

        if (this.asset === false || this.asset.dual) {
            var address = privateKey.toAddress().toString();
            var signature = new Message(this.uri).sign(privateKey);
        } else {
            if (!Address.isValid(assetAddress))
                throw "Invalid asset address";
            
            if (!PrivateKey.isValid(assetKey))
                throw "Invalid asset private key";
                
            var address = assetAddress;
            var signature = new Message(this.uri).sign(new PrivateKey(assetKey));
        }

        var result = { uri: this.uri, address, signature };

        if (this.asset.dual) {
            if (!Address.isValid(assetAddress))
                throw "Invalid asset address";
            
            if (!PrivateKey.isValid(assetKey))
                throw "Invalid asset private key";

            result.assetaddress = assetAddress;
            result.assetsignature = new Message(this.uri).sign(new PrivateKey(assetKey));
        }

        return result;
    }
    static verify({ uri, address, signature }) {
        return new Message(uri).verify(address, signature);
    }
}

module.exports = DigiID;