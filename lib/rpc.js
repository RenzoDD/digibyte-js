const { post } = require('./util/request');

/**
 * @param {string} user
 * @param {string} pass
 * @param {string} host
 * @param {int}    port
 */
function RPC(user, pass, host = 'localhost', port = 14022) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.pass = pass;
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.call = async function () {
    var method = arguments[0];
    var params = [...arguments].splice(1);

    var data = JSON.stringify({ method, params, id: '1' });
    var url = `http://${this.host}:${this.port}/`;

    var response = await post(url, data, {}, this.user + ':' + this.pass);
    if (response.error) return { error: response.error };
    return response.result;
}


/**
 * Blockchain RPCs
 */

/**
 * @returns {Promise<string>} Block Hash
 */
RPC.prototype.getBestBlockHash = async function () {
    return this.call('getbestblockhash', ...(Array.from(arguments)));
}

/**
 * @param {string} blockhash 
 * @returns {Promise<{bits:string, chainwork:string, confirmations:number, difficulty:nunmber, hash:string, height:number, mediantime:number, merkleroot:string, nTx:number, nextblockhash:string, nonce:number, pow_algo:string, pow_algo_id:number, pow_hash:string, previousblockhash:string, size:number, strippedsize:number, time:number, tx:Array<string>, version:number, versionHex:string, weight:number}>}
 */
RPC.prototype.getBlock = async function (blockhash) {
    return this.call('getblock', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<{bestblockhash:string, bip9_softforks:{csv:{since:number, startTime:number, status:string, timeout:number},nversionbips:{since:number, startTime:number, status:string, timeout:number}, odo:{since:number, startTime:number, status:string, timeout:number}, reservealgo:{since:number, startTime:number, status:string, timeout:number}, segwit:{since:number, startTime:number, status:string, timeout:number}}, blocks:number, chain:string, chainwork:string, difficulties:{odo:number, qubit:number, scrypt:number, sha256d:number, skein:number}, headers:number, initialblockdownload:boolean, mediantime:number, pruned:false, size_on_disk:number, softforks:Array<>, verificationprogress:number, warnings:string }>}
 */
RPC.prototype.getBlockChainInfo = async function () {
    return this.call('getblockchaininfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<number>}
 */
RPC.prototype.getBlockCount = async function () {
    return this.call('getblockcount', ...(Array.from(arguments)));
}

/**
 * @param {number} height
 * @returns {Promise<string>}
 */
RPC.prototype.getBlockHash = async function (height) {
    return this.call('getblockhash', ...(Array.from(arguments)));
}

/**
 * @param {string} blockhash
 * @returns {Promise<{bits:string, chainwork:string, confirmations:number, difficulty:number, hash:string, height:number, mediantime:number, merkleroot:string, nTx:number, nextblockhash:string, nonce:number, previousblockhash:string, time:number, version:number, versionHex:string}>}
 */
RPC.prototype.getBlockHeader = async function (blockhash) {
    return this.call('getblockheader', ...(Array.from(arguments)));
}

/**
 * @param {string} blockhash
 * @returns {Promise<{avgfee:number, avgfeerate:number, avgtxsize:number, blockhash:string, feerate_percentiles:number[], height:number, ins:number, maxfee:number, maxfeerate:number, maxtxsize:number, medianfee:number, mediantime:number, mediantxsize:number, minfee:number, minfeerate:number, mintxsize:number, outs:number, subsidy:number, swtotal_size:number, swtotal_weight:number, swtxs:number, time:number, total_out:number, total_size:number, total_weight:number, totalfee:number, txs:number, utxo_increase:number, utxo_size_inc:number}>}
 */
RPC.prototype.getBlockStats = async function (blockhash) {
    return this.call('getblockstats', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getChainTips = async function () {
    // CHECK
    return this.call('getchaintips', ...(Array.from(arguments)));
}

/**
 * @param {number} nblocks
 * @param {string} blockhash
 * @returns {Promise<{time:number, txcount:number, txrate:number, window_block_count:number, window_final_block_hash:string, window_interval:number, window_tx_count:number}>}
 */
RPC.prototype.getChainTxStats = async function (nblocks, blockhash) {
    return this.call('getchaintxstats', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<number>}
 */
RPC.prototype.getDifficulty = async function () {
    return this.call('getdifficulty', ...(Array.from(arguments)));
}

/**
 * @param {string} txid
 * @param {boolean} verbose
 * @returns {Promise<>}
 */
RPC.prototype.getMempoolAncestors = async function (txid, verbose) {
    return this.call('getmempoolancestors', ...(Array.from(arguments)));
}

/**
 * @param {string} txid
 * @param {boolean} verbose
 * @returns {Promise<>}
 */
RPC.prototype.getMempoolDescendants = async function (txid, verbose) {
    return this.call('getmempooldescendants', ...(Array.from(arguments)));
}

/**
 * @param {string} txid
 * @returns {Promise<>}
 */
RPC.prototype.getMempoolEntry = async function (txid) {
    return this.call('getmempoolentry', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<{bytes:number, maxmempool:number, mempoolminfee:number, minrelaytxfee:number, size:number, usage:number}>}
 */
RPC.prototype.getMempoolInfo = async function () {
    return this.call('getmempoolinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<Array<string>>}
 */
RPC.prototype.getRawMempool = async function () {
    return this.call('getrawmempool', ...(Array.from(arguments)));
}

/**
 * @param {string} txid
 * @param {number} n
 * @param {boolean} mempool
 * @returns {Promise<>}
 */
RPC.prototype.getTxOut = async function (txid, n, mempool) {
    return this.call('gettxout', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getTxOutProof = async function () {
    return this.call('gettxoutproof', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getTxOutSetInfo = async function () {
    return this.call('gettxoutsetinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.preciousBlock = async function () {
    return this.call('preciousblock', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.pruneBlockChain = async function () {
    return this.call('pruneblockchain', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.saveMempool = async function () {
    return this.call('savemempool', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.scanTxOutSet = async function () {
    return this.call('scantxoutset', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.verifyChain = async function () {
    return this.call('verifychain', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.verifyTxOutProof = async function () {
    return this.call('verifytxoutproof', ...(Array.from(arguments)));
}



/**
 * Control RPCs
 */

/**
 * @returns {Promise<>}
 */
RPC.prototype.getMemoryInfo = async function () {
    return this.call('getmemoryinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getRpcInfo = async function () {
    return this.call('getrpcinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.help = async function () {
    return this.call('help', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.logging = async function () {
    return this.call('logging', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.stop = async function () {
    return this.call('stop', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.upTime = async function () {
    return this.call('uptime', ...(Array.from(arguments)));
}



/**
 * Generating RPCs
 */

/**
 * @returns {Promise<>}
 */
RPC.prototype.generate = async function () {
    return this.call('generate', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.generateToAddress = async function () {
    return this.call('generatetoaddress', ...(Array.from(arguments)));
}



/**
 * Mining RPCs
 */

/**
 * @returns {Promise<>}
 */
RPC.prototype.getBlockTemplate = async function () {
    return this.call('getblocktemplate', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getMiningInfo = async function () {
    return this.call('getmininginfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getNetworkHashps = async function () {
    return this.call('getnetworkhashps', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.prioritiseTransaction = async function () {
    return this.call('prioritisetransaction', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.submitBlock = async function () {
    return this.call('submitblock', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.submitHeader = async function () {
    return this.call('submitheader', ...(Array.from(arguments)));
}



/**
 * Network RPCs
 */

/**
 * @returns {Promise<>}
 */
RPC.prototype.addNode = async function () {
    return this.call('addnode', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.clearBanned = async function () {
    return this.call('clearbanned', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.disconnectNode = async function () {
    return this.call('disconnectnode', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getAddedNodeInfo = async function () {
    return this.call('getaddednodeinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getConnectionCount = async function () {
    return this.call('getconnectioncount', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getNetTotals = async function () {
    return this.call('getnettotals', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getNetworkInfo = async function () {
    return this.call('getnetworkinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getNodeAddresses = async function () {
    return this.call('getnodeaddresses', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getPeerInfo = async function () {
    return this.call('getpeerinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listBanned = async function () {
    return this.call('listbanned', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.ping = async function () {
    return this.call('ping', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.setBan = async function () {
    return this.call('setban', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.setNetworkActive = async function () {
    return this.call('setnetworkactive', ...(Array.from(arguments)));
}



/**
 * Raw Transactions RPCs
 */

/**
 * @returns {Promise<>}
 */
RPC.prototype.analyzePsbt = async function () {
    return this.call('analyzepsbt', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.combinePsbt = async function () {
    return this.call('combinepsbt', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.combineRawTransaction = async function () {
    return this.call('combinerawtransaction', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.convertToPsbt = async function () {
    return this.call('converttopsbt', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.createPsbt = async function () {
    return this.call('createpsbt', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.createRawTransaction = async function () {
    return this.call('createrawtransaction', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.decodePsbt = async function () {
    return this.call('decodepsbt', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.decodeRawTransaction = async function () {
    return this.call('decoderawtransaction', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.decodeScript = async function () {
    return this.call('decodescript', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.finalizePsbt = async function () {
    return this.call('finalizepsbt', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.fundRawTransaction = async function () {
    return this.call('fundrawtransaction', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getRawTransaction = async function () {
    return this.call('getrawtransaction', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.joinPsbts = async function () {
    return this.call('joinpsbts', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.sendRawTransaction = async function () {
    return this.call('sendrawtransaction', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.signRawTransactionWithKey = async function () {
    return this.call('signrawtransactionwithkey', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.testMempoolAccept = async function () {
    return this.call('testmempoolaccept', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.utxoUpdatePsbt = async function () {
    return this.call('utxoupdatepsbt', ...(Array.from(arguments)));
}



/**
 * Util RPCs
 */

/**
 * @returns {Promise<>}
 */
RPC.prototype.createMultisig = async function () {
    return this.call('createmultisig', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.deriveAddresses = async function () {
    return this.call('deriveaddresses', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.estimateSmartFee = async function () {
    return this.call('estimatesmartfee', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getDescriptorInfo = async function () {
    return this.call('getdescriptorinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.signMessageWithPrivKey = async function () {
    return this.call('signmessagewithprivkey', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.validateAddress = async function () {
    return this.call('validateaddress', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.verifyMessage = async function () {
    return this.call('verifymessage', ...(Array.from(arguments)));
}



/**
 * Wallet RPCs
 */

/**
 * @returns {Promise<>}
 */
RPC.prototype.abandonTransaction = async function () {
    return this.call('abandontransaction', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.abortRescan = async function () {
    return this.call('abortrescan', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.addMultisigAddress = async function () {
    return this.call('addmultisigaddress', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.backupWallet = async function () {
    return this.call('backupwallet', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.bumpFee = async function () {
    return this.call('bumpfee', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.createWallet = async function () {
    return this.call('createwallet', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.dumpPrivKey = async function () {
    return this.call('dumpprivkey', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.dumpWallet = async function () {
    return this.call('dumpwallet', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.encryptWallet = async function () {
    return this.call('encryptwallet', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getAddressesByLabel = async function () {
    return this.call('getaddressesbylabel', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getAddressInfo = async function () {
    return this.call('getaddressinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getBalance = async function () {
    return this.call('getbalance', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getNewAddress = async function () {
    return this.call('getnewaddress', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getRawChangeAddress = async function () {
    return this.call('getrawchangeaddress', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getReceivedByAddress = async function () {
    return this.call('getreceivedbyaddress', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getReceivedByLabel = async function () {
    return this.call('getreceivedbylabel', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getTransaction = async function () {
    return this.call('gettransaction', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getUnconfirmedBalance = async function () {
    return this.call('getunconfirmedbalance', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getWalletInfo = async function () {
    return this.call('getwalletinfo', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.importAddress = async function () {
    return this.call('importaddress', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.importMulti = async function () {
    return this.call('importmulti', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.importPrivKey = async function () {
    return this.call('importprivkey', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.importPrunedFunds = async function () {
    return this.call('importprunedfunds', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.importPubKey = async function () {
    return this.call('importpubkey', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.importWallet = async function () {
    return this.call('importwallet', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.keyPoolRefill = async function () {
    return this.call('keypoolrefill', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listAddressGroupings = async function () {
    return this.call('listaddressgroupings', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listLabels = async function () {
    return this.call('listlabels', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listLockUnspent = async function () {
    return this.call('listlockunspent', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listReceivedByAddress = async function () {
    return this.call('listreceivedbyaddress', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listReceivedByLabel = async function () {
    return this.call('listreceivedbylabel', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listSinceBlock = async function () {
    return this.call('listsinceblock', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listTransactions = async function () {
    return this.call('listtransactions', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listWalletDir = async function () {
    return this.call('listwalletdir', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.listWallets = async function () {
    return this.call('listwallets', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.loadWallet = async function () {
    return this.call('loadwallet', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.lockUnspent = async function () {
    return this.call('lockunspent', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.removePrunedFunds = async function () {
    return this.call('removeprunedfunds', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.rescanBlockChain = async function () {
    return this.call('rescanblockchain', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.sendMany = async function () {
    return this.call('sendmany', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.sendToAddress = async function () {
    return this.call('sendtoaddress', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.setHdSeed = async function () {
    return this.call('sethdseed', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.setLabel = async function () {
    return this.call('setlabel', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.setTxFee = async function () {
    return this.call('settxfee', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.signMessage = async function () {
    return this.call('signmessage', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.signRawTransactionWithWallet = async function () {
    return this.call('signrawtransactionwithwallet', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.unloadWallet = async function () {
    return this.call('unloadwallet', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.walletCreateFundedPsbt = async function () {
    return this.call('walletcreatefundedpsbt', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.walletLock = async function () {
    return this.call('walletlock', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.walletPassPhrase = async function () {
    return this.call('walletpassphrase', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.walletPassPhraseChange = async function () {
    return this.call('walletpassphrasechange', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.walletProcessPsbt = async function () {
    return this.call('walletprocesspsbt', ...(Array.from(arguments)));
}



/**
 * DigiAsset Core RPCs
 */

/**
 * @returns {Promise<>}
 */
RPC.prototype.addressStats = async function () {
    return this.call('addressstats', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.algoStats = async function () {
    return this.call('algostats', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<{address:string, country:string name?:string, hash?:string }>}
 */
RPC.prototype.getAddressKyc = async function (address) {
    return this.call('getaddresskyc', ...(Array.from(arguments)));
}

/**
 * @param {string} assetId
 * @returns {Promise<{assetId:string,assetIndex:number,cid:string,count:number,decimals:number,ipfs:{},issuer:{address:string,country:string,hash:string}}>}
 */
RPC.prototype.getAssetData = async function (assetId) {
    return this.call('getassetdata', ...(Array.from(arguments)));
}

/**
 * @param {string} assetId
 * @returns {Promise<{'address':'amount'}>}
 */
RPC.prototype.getAssetHolders = async function (assetId) {
    return this.call('getassetholders', ...(Array.from(arguments)));
}

/**
 * @param {number} numberOfResults
 * @param {number} start
 * @returns {Promise<{assetId:string, assetIndex:number, cid:string, height:number}[]>}
 */
RPC.prototype.getAssetList = async function (numberOfResults, start) {
    return this.call('getassetlist', ...(Array.from(arguments)));
}

/**
 * @param {string} assetId
 * @returns {Promise<number[]>}
 */
RPC.prototype.getAssetIndexes = async function (assetId) {
    return this.call('getassetindexes', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getDgbEquivalent = async function () {
    return this.call('getdgbequivalent', ...(Array.from(arguments)));
}

/**
 * @param {string} domain
 * @returns {Promise<string>}
 */
RPC.prototype.getDomainAddress = async function (domain) {
    return this.call('getdomainaddress', ...(Array.from(arguments)));
}

/**
 * @param {number} height (optional)
 * @returns {Promise<{address:string, height:number, index:number, value:number}[]>}
 */
RPC.prototype.getExchangeRates = async function (height) {
    return this.call('getexchangerates', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.getIpfsCount = async function () {
    return this.call('getipfscount', ...(Array.from(arguments)));
}

/**
 * @param {string} txid
 * @param {boolean} verbose
 * @returns {Promise<>}
 */
RPC.prototype.getRawTransaction = async function (txid, verbose) {
    return this.call('getrawtransaction', ...(Array.from(arguments)));
}

/**
 * @param {string} address
 * @param {number} minHeight
 * @param {number} maxHeight
 * @returns {Promise<string[]>}
 */
RPC.prototype.listAddressHistory = async function (address, minHeight, maxHeight) {
    return this.call('listaddresshistory', ...(Array.from(arguments)));
}

/**
 * @param {number} minconf
 * @param {number} maxconf
 * @param {string[]} addresses
 * @param {boolean} unsafe
 * @param {{minimumAmount:number, maximumAmount:number, maximumCount:number, minimumSumAmount:number, includeAsset}} query
 * @returns {Promise<Array<{address:string, assets:{assetId:string, assetIndex:number, cid:string, count:number, decimals:number}[], digibyte:number, txid:string, vout:number}>>}
 */
RPC.prototype.listUnspent = async function (minconf, maxconf, addresses, unsafe, query) {
    return this.call('listunspent', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.resyncmetadata = async function () {
    return this.call('resyncMetadata', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.send = async function () {
    return this.call('send', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.sendmany = async function () {
    return this.call('sendmany', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.sendToAddress = async function () {
    return this.call('sendtoaddress', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<>}
 */
RPC.prototype.shutdown = async function () {
    return this.call('shutdown', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<{count:number, sync:number}>}
 */
RPC.prototype.syncState = async function () {
    return this.call('syncstate', ...(Array.from(arguments)));
}

/**
 * @returns {Promise<string>}
 */
RPC.prototype.version = async function () {
    return this.call('version', ...(Array.from(arguments)));
}




module.exports = RPC;