const https = require('https');
const http = require('http');
const Address = require('./address');
const Script = require('./script/script');

class Explorer {

    static explorers = [
        { domain: "digibyteblockexplorer.com", https: true },
        { domain: "digibyte.atomicwallet.io", https: true },
        { domain: "dgbbook.guarda.co", https: true },
        { domain: "digiexplorer.info", https: true },
        { domain: "13.114.142.49", https: false },
    ] // Updated on Sep 15th 2022

    constructor(explorer) {
        if (!explorer)
            explorer = Explorer.explorers[0];
        else if (typeof explorer == "string")
            explorer = { domain: explorer, https: true };

        this.domain = explorer.domain;
        this.https = explorer.https;
    }

    get url() {
        return (this.https ? "https" : "http") + "://" + this.domain + "/api/v2/";
    }

    /**
     * Get the status of the DigiByte network
     * 
     * @returns { { blockbook: { coin: String, host: String, version: String, gitCommit: String, buildTime: String, syncMode: Boolean, initialSync: Boolean, inSync: Boolean, bestHeight: Number, lastBlockTime: String, inSyncMempool: Boolean, lastMempoolTime: String, mempoolSize: Number, decimals: Number, dbSize: Number, about: String }, backend: { chain: String, blocks: Number, headers: Number, bestBlockHash: String, sizeOnDisk: Number, version: String, subversion: String, protocolVersion: String } } }
     */
    async status() {
        var data = await this.#getData(this.url);
        return data;
    }

    /**
     * Get a block hash
     * 
     * @param { Number } height - Blockchain height
     * @returns { { blockhash: String } }
     */
    async blockHash(height) {
        var data = await this.#getData(this.url + "block-index/" + height);
        return data;
    }

    /**
     * Get transaction information
     * 
     * @param { String } txid - Transaction ID
     * @returns { { txid: String, version: Number, lockTime: Number, vin: Array<{ txid: String, sequence: String, n: Number, addresses: Array<String>, isAddress: Boolean, value: String, hex: String }>, vout: Array<{ value: String, n: Number, spent?: Boolean, hex: String, addresses: Array<String>, isAddress: Boolean }>, blockHash: String, blockHeight: Number, confirmations: Number, blockTime: Number, value: String, valueIn: String, fees: String, hex: String } }
     */
    async transaction(txid) {
        var data = await this.#getData(this.url + "tx/" + txid);
        return data;
    }

    /**
     * Get address information
     * @param { String } address - DigiByte address
     * @param { { page: Number, pageSize: Number, from: Number, to: Number, details: ('basic'|'txids'|'txslight'|'txs') } } options - Data options
     * @returns { { page: Number, totalPages: Number, itemsOnPage: Number, address: String, balance: String, totalReceived: String, totalSent: String, unconfirmedBalance: String, unconfirmedTxs: Number, txs: Number, txids: Array<String> transactions: Array<{ txid: String, version: Number, lockTime: Number, vin: Array<{ txid: String, sequence: String, n: Number, addresses: Array<String>, isAddress: Boolean, value: String, hex: String }>, vout: Array<{ value: String, n: Number, spent?: Boolean, hex: String, addresses: Array<String>, isAddress: Boolean }>, blockHash: String,blockHeight: Number, confirmations: Number, blockTime: Number, value: String, valueIn: String, fees: String, hex: String}> } }
     */
    async address(address, options = {}) {
        var params = "?";
        for (var o of Object.keys(options))
            params += o + "=" + options[o] + "&";
        params = params.length == 1 ? "" : params;

        var data = await this.#getData(this.url + "address/" + address + params);
        return data;
    }

    /**
     * Get an xpub information
     * 
     * @param { String } xpub - XPUB string
     * @param { ('pkh'|'sh'|'wpkh') } type - Type Modifier
     * @param { { page: Number, pageSize: Number, from: Number, to: Number, details: ('basic'|'txids'|'txslight'|'txs'), tokens: ('nonzero'|'used'|'derived') } } options - Data options
     * @return { { page: Number, totalPages: Number, itemsOnPage: Number, address: String, balance: String, totalReceived: String, totalSent: String, unconfirmedBalance: String, unconfirmedTxs: Number, txs: Number, transactions: Array<{ txid: String, version: Number, vin: Array<{ txid: String, sequence: String, n: Number, addresses: Array<String>, isAddress: Boolean, value: String, hex: String }>, vout: Array<{ value: String, n: Number, spent?: Boolean, hex: String, addresses: Array<String>, isAddress: Boolean }>, blockHash: String, blockHeight: Number, confirmations: Number, blockTime: Number, value: String, valueIn: String, fees: String, hex: String }>, usedTokens: Number, tokens: Array<{ type: String, name: String, path: String, transfers: Number, decimals: Number, balance: String, totalReceived: String, totalSent: String }> } }
     */
    async xpub(xpub, type = null, options = {}) {
        var prefix = xpub.substring(0, 4);
        if (type)
            if ((prefix == "xpub" && type != "pkh") || (prefix == "ypub" && type != "sh") || (prefix == "zpub" && type != "wpkh")) {
                xpub = type == "sh" ? `wpkh(${xpub})` : xpub;
                xpub = `${type}(${xpub})`
            }

        var params = "?";
        for (var o of Object.keys(options))
            params += o + "=" + options[o] + "&";
        params = params.length == 1 ? "" : params;

        var data = await this.#getData(this.url + "xpub/" + xpub + params);
        return data;
    }

    /**
     * Get UTXO information of address or xpub
     * 
     * @param { String } descriptor - Address or XPUB
     * @param { ('pkh'|'sh'|'wpkh') } type - Type Modifier
     * @param { { confirmed: Boolean } } options - Data options
     * @return { Array<{ txid: Number, vout: Number, value: String, scriptPubKey?: String, height?: Number, confirmations?: Number, locktime?: Number, coinbase?: Boolean, path?: String, address?: String }> }
     */
    async utxo(descriptor, type = null, options = {}) {
        var prefix = descriptor.substring(0, 4);
        if (type)
            if ((prefix == "xpub" && type != "pkh") || (prefix == "ypub" && type != "sh") || (prefix == "zpub" && type != "wpkh")) {
                descriptor = type == "sh" ? `wpkh(${descriptor})` : descriptor;
                descriptor = `${type}(${descriptor})`
            }

        var params = "?";
        for (var o of Object.keys(options))
            params += o + "=" + options[o] + "&";
        params = params.length == 1 ? "" : params;

        var data = await this.#getData(this.url + "utxo/" + descriptor + params);
        if (Address.isValid(descriptor))
            var scriptPubKey = Script.fromAddress(descriptor).toHex();

        for (var utxo of data) {
            utxo.satoshis = parseInt(utxo.value);
            delete utxo.value;
            utxo.scriptPubKey = utxo.address ? Script.fromAddress(utxo.address).toHex() : scriptPubKey;
        }
        return data;
    }

    /**
     * Get block information
     * 
     * @param { Number | String } block - Block height or block hash
     * @return { { page: Number, totalPages: Number, itemsOnPage: Number, hash: String, previousBlockHash: String, nextBlockHash: String, height: Number, confirmations: Number, size: Number, time: Number, version: Number, merkleRoot: String, nonce: String, bits: String, difficulty: String, txCount: Number, txs: Array<{ txid: String, vin: Array<{ txid: String, sequence: String, n: Number, addresses: Array<String>, isAddress: Boolean, value: String, hex: String }>, vout: Array<{ value: String, n: Number, spent?: Boolean, hex: String, addresses: Array<String>, isAddress: Boolean }>, blockHash: String, blockHeight: Number, confirmations: Number, blockTime: Number, value: String, valueIn: String, fees: String, }> } }
     */
    async block(block) {
        var data = await this.#getData(this.url + "block/" + block);
        return data;
    }

    /**
     * Broadcast a transaction to the DigiByte network
     * 
     * @param { String } hex - Serialized transaction
     * @returns { { result?: String, error?: { message: String } } }
     */
    async sendtx(hex) {
        var data = await this.#postData(this.url + "sendtx/", hex);
        return data;
    }

    #getData(url) {
        return new Promise(async (resolve, reject) => {
            (this.https ? https : http).get(url, function (result) {
                let data = "";
                result.on("data", (buffer) => { data += buffer; });
                result.on("end", function () {
                    try {
                        var json = JSON.parse(data);
                        resolve(json);
                    }
                    catch {
                        resolve({ error: "HTTP JSON parse error" });
                    }
                });
                result.on('error', () => { resolve({ error: "HTTP request error" }) })
            });
        });
    }
    #postData(url, data) {
        if (typeof data == 'object')
            data = JSON.stringify(data);

        const dataString = data;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataString.length,
            }
        }

        return new Promise((resolve, reject) => {
            const req = (this.https ? https : http).request(url, options, (res) => {
                const body = []
                res.on('data', (chunk) => body.push(chunk))
                res.on('end', () => {
                    const resString = Buffer.concat(body).toString();
                    var json = null;
                    try { json = JSON.parse(resString) }
                    catch { }
                    resolve(json);
                })
            });
            req.on('error', (err) => { resolve(null) });
            req.write(dataString);
            req.end();
        })
    }
}

module.exports = Explorer;