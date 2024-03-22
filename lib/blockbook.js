const { get, post } = require('./util/request');

function Blockbook(explorer, version = 'v2', retry = 0) {
    if (explorer && typeof explorer == 'string')
        this.explorers = [{ domain: explorer, https: true }];
    else if (explorer && explorer.length)
        this.explorers = explorer;
    else
        this.explorer = Blockbook.explorers;

    if (typeof version == 'number')
        this.version = 'v' + version;
    else if (typeof version == 'string')
        this.version = version;

    if (retry < 0)
        this.retry = 0;
    else
        this.retry = retry;
}

Blockbook.prototype = {
    get url() {
        var explorer = this.explorer[Math.floor(Math.random() * Blockbook.explorers.length)];
        return `${(explorer.https ? "https" : "http")}://${explorer.domain}/api/${this.version}/`;
    }
};

Blockbook.explorers = [
    { domain: "digibyteblockexplorer.com", https: true },
    { domain: "digibyte.atomicwallet.io", https: true },
    { domain: "digiexplorer.info", https: true },
    { domain: "13.114.142.49", https: false }
] // Updated on Nov 17th 2023

/**
 * Get the status of the DigiByte network
 * 
 * @returns { { blockbook: { coin: String, host: String, version: String, gitCommit: String, buildTime: String, syncMode: Boolean, initialSync: Boolean, inSync: Boolean, bestHeight: Number, lastBlockTime: String, inSyncMempool: Boolean, lastMempoolTime: String, mempoolSize: Number, decimals: Number, dbSize: Number, about: String }, backend: { chain: String, blocks: Number, headers: Number, bestBlockHash: String, sizeOnDisk: Number, version: String, subversion: String, protocolVersion: String } } }
 */
Blockbook.prototype.status = async function () {
    for (var i = 0; i <= this.retry; i++) {
        var data = await get(this.url);
        if (!data.error) break;
    }
    return data;
}

/**
 * Get a block hash
 * 
 * @param { Number } height - Blockchain height
 * @returns { { blockhash: String } }
 */
Blockbook.prototype.blockHash = async function (height) {
    for (var i = 0; i <= this.retry; i++) {
        var data = await get(this.url + "block-index/" + height);
        if (!data.error) break;
    }
    return data;
}

/**
 * Get transaction information
 * 
 * @param { String } txid - Transaction ID
 * @returns { txid: String, version: Number, vin: Array<{ txid: String, vout: Number?, sequence: Number, n: Number, addresses: Array<String>, isAddress: Boolean, value: String  }>, vout: Array<{ value: String, n: Number, hex: String, addresses: Array<String>, isAddress: Boolean, spend: Boolean }>, blockHash: String, blockHeight: Number, confirmations: Number, blockTime: Number, value: String, valueIn: String, fees: String, hex: String }
 */
Blockbook.prototype.transaction = async function (txid) {
    for (var i = 0; i <= this.retry; i++) {
        var data = await get(this.url + "tx/" + txid);
        if (!data.error) break;
    }
    return data;
}

/**
 * Get address information
 * @param { String } address - DigiByte address
 * @param { { page: Number, pageSize: Number, from: Number, to: Number, details: ('basic'|'txids'|'txslight'|'txs') } } options - Data options
 * @returns { { page?: Number, totalPages?: Number, itemsOnPage?: Number, address: String, balance: String, totalReceived: String, totalSent: String, unconfirmedBalance: String, unconfirmedTxs: Number, txs: Number, txids?: Array<String> transactions?: Array<{ txid: String, version?: Number, vin: Array<{ txid?: String, vout?: Number?, sequence?: Number, n: Number, addresses: Array<String>, isAddress: Boolean, value: String  }>, vout: Array<{ value: String, n: Number, hex?: String, addresses: Array<String>, isAddress: Boolean, spend?: Boolean }>, blockHash: String, blockHeight: Number, confirmations: Number, blockTime: Number, value: String, valueIn: String, fees: String, hex?: String }> } }
 */
Blockbook.prototype.address = async function (address, options = {}) {
    var params = "?";
    for (var o of Object.keys(options))
        params += o + "=" + options[o] + "&";
    params = params.length == 1 ? "" : params;

    for (var i = 0; i <= this.retry; i++) {
        var data = await get(this.url + "address/" + address + params);
        if (!data.error) break;
    }
    return data;
}

/**
 * Get an xpub information
 * 
 * @param { String } xpub - XPUB string
 * @param { ('pkh'|'sh'|'wpkh') } type - Type Modifier
 * @param { { page: Number, pageSize: Number, from: Number, to: Number, details: ('basic'|'txids'|'txslight'|'txs'), tokens: ('nonzero'|'used'|'derived') } } options - Data options
 * @return { { page?: Number, totalPages?: Number, itemsOnPage?: Number, address: String, balance: String, totalReceived: String, totalSent: String, unconfirmedBalance: String, unconfirmedTxs: Number, txs: Number, txids?: Array<String> usedTokens: Number tokens?: Array<{ type: String, name: String, path: String, transfers: Number, decimals: Number, balance: String, totalReceived: String, totalSent: String }> } }
 */
Blockbook.prototype.xpub = async function (xpub, type = null, options = {}) {
    var prefix = xpub.substring(0, 4);
    if (type) {
        type = type == 'legacy' ? 'pkh' : type;
        type = type == 'script' ? 'sh' : type;
        type = type == 'segwit' ? 'wpkh' : type;
        type = type == 'compatibility' ? 'sh' : type;

        if ((prefix == "xpub" && type != "pkh") || (prefix == "ypub" && type != "sh") || (prefix == "zpub" && type != "wpkh")) {
            xpub = type == "sh" ? `wpkh(${xpub})` : xpub;
            xpub = `${type}(${xpub})`
        }
    }

    var params = "?";
    for (var o of Object.keys(options))
        params += o + "=" + options[o] + "&";
    params = params.length == 1 ? "" : params;

    for (var i = 0; i <= this.retry; i++) {
        var data = await get(this.url + "xpub/" + xpub + params);
        if (!data.error) break;
    }
    return data;
}

/**
 * Get UTXO information of address or xpub
 * 
 * @param { String } descriptor - Address or XPUB
 * @param { ('pkh'|'sh'|'wpkh') } type - Type Modifier
 * @param { { confirmed: Boolean } } options - Data options
 * @return { Array<{ txid: Number, vout: Number, satoshis: String, address: String, height?: Number, confirmations?: Number, locktime?: Number, coinbase?: Boolean, path?: String }> }
 */
Blockbook.prototype.utxo = async function (descriptor, type = null, options = {}) {
    var prefix = descriptor.substring(0, 4);
    if (type) {
        type = type == 'legacy' ? 'pkh' : type;
        type = type == 'script' ? 'sh' : type;
        type = type == 'segwit' ? 'wpkh' : type;
        type = type == 'compatibility' ? 'sh' : type;

        if ((prefix == "xpub" && type != "pkh") || (prefix == "ypub" && type != "sh") || (prefix == "zpub" && type != "wpkh")) {
            descriptor = type == "sh" ? `wpkh(${descriptor})` : descriptor;
            descriptor = `${type}(${descriptor})`
        }
    }

    var params = "?";
    for (var o of Object.keys(options))
        params += o + "=" + options[o] + "&";
    params = params.length == 1 ? "" : params;

    for (var i = 0; i <= this.retry; i++) {
        var data = await get(this.url + "utxo/" + descriptor + params);
        if (!data.error) break;
    }

    if (data.error) return data;

    data.map(function (utxo) {
        utxo.satoshis = parseInt(utxo.value);
        utxo.address = utxo.address ? utxo.address : descriptor;

        delete utxo.value;
        delete utxo.scriptPubKey;
    });

    return data;
}

/**
 * Get block information
 * 
 * @param { Number | String } block - Block height or block hash
 * @return { { "page": Number, "totalPages": Number, "itemsOnPage": Number, "hash": String, "previousBlockHash": String, "nextBlockHash": String, "height": Number, "confirmations": Number, "size": Number, "time": Number, "version": Number, "merkleRoot": String, "nonce": String, "bits": String, "difficulty": String, "txCount": Number, "txs": Array < { "txid": String, "vin": Array < { n: Number, isAddress: Boolean, value: String } >, "vout": Array < { value: String, n: Number, addresses: Array < String >, isAddress: Boolean } >, "blockHash": String, "blockHeight": 18784800, "confirmations": 17, "blockTime": 1708369586, "value": String, "valueIn": String, "fees": String } > } }
 */
Blockbook.prototype.block = async function (block) {
    for (var i = 0; i <= this.retry; i++) {
        var data = await get(this.url + "block/" + block);
        if (!data.error) break;
    }
    return data;
}

/**
 * Broadcast a transaction to the DigiByte network
 * 
 * @param { String } hex - Serialized transaction
 * @returns { { result?: String, error?: { message: String } } }
 */
Blockbook.prototype.sendtx = async function (hex) {
    for (var i = 0; i <= this.retry; i++) {
        var data = await post(this.url + "sendtx/", hex);
        if (!data.error) break;
    }
    return data;
}

module.exports = Blockbook;