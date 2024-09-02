/**
 * RPC Class
 */

/**
 * @param {string} host
 * @param {int}    port
 */
function RPC(host = '127.0.0.1', port = 14022) {
    this.host = host;
    this.port = port;
    this.user = undefined;
    this.pass = undefined;
    this.wallet = undefined;
}
RPC.prototype = {
    get uri() {
        return `http://${this.host}:${this.port}/` + (typeof this.wallet !== 'undefined' ? `wallet/${this.wallet}` : '');
    },
    get auth() {
        if (!this.user || !this.pass) return '';
        return 'Basic ' + Buffer.from(this.user + ':' + this.pass).toString('base64');
    }
}

/**
 * @param {string} user
 * @param {string} pass
 */
RPC.prototype.setCredentials = function (user, pass) {
    this.user = user;
    this.pass = pass;
    return this;
}
/**
 * @param {string} wallet
 */
RPC.prototype.setWallet = function (wallet) {
    this.wallet = wallet;
    return this;
}

RPC.prototype.call = async function () {
    var method = arguments[0];
    var params = [...arguments].splice(1);

    try {
        var data = JSON.stringify({ method, params, id: '1' });
        var response = await fetch(this.uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.auth
            },
            body: data
        });
        var data = await response.json();
        if (data.error) return { error: data.error.message }
        return data.result;
    } catch (e) {
        return { error: e.message }
    }
}



/**
 * Blockchain RPCs
 */

/**
 * Returns the hash of the best (tip) block in the most-work fully-validated chain.
 * @returns {Promise<string>} Block Hash
 */
RPC.prototype.getBestBlockHash = async function () {
    return this.call('getbestblockhash', ...(Array.from(arguments)));
}

/**
 * If verbosity is 0, returns a string that is serialized, hex-encoded data for block ‘hash’.
 * If verbosity is 1, returns an Object with information about block ‘hash’.
 * If verbosity is 2, returns an Object with information about block ‘hash’ and information about each transaction.
 * @param {string} blockhash 
 * @returns {Promise<{bits:string, chainwork:string, confirmations:number, difficulty:nunmber, hash:string, height:number, mediantime:number, merkleroot:string, nTx:number, nextblockhash:string, nonce:number, pow_algo:string, pow_algo_id:number, pow_hash:string, previousblockhash:string, size:number, strippedsize:number, time:number, tx:Array<string>, version:number, versionHex:string, weight:number}>}
 */
RPC.prototype.getBlock = async function (blockhash, verbosity) {
    return this.call('getblock', ...(Array.from(arguments)));
}

/**
 * Returns an object containing various state info regarding blockchain processing.
 * @returns {Promise<{bestblockhash:string, bip9_softforks:{csv:{since:number, startTime:number, status:string, timeout:number},nversionbips:{since:number, startTime:number, status:string, timeout:number}, odo:{since:number, startTime:number, status:string, timeout:number}, reservealgo:{since:number, startTime:number, status:string, timeout:number}, segwit:{since:number, startTime:number, status:string, timeout:number}}, blocks:number, chain:string, chainwork:string, difficulties:{odo:number, qubit:number, scrypt:number, sha256d:number, skein:number}, headers:number, initialblockdownload:boolean, mediantime:number, pruned:false, size_on_disk:number, softforks:Array<>, verificationprogress:number, warnings:string }>}
 */
RPC.prototype.getBlockChainInfo = async function () {
    return this.call('getblockchaininfo', ...(Array.from(arguments)));
}

/**
 * Returns the height of the most-work fully-validated chain.
 * The genesis block has height 0.
 * @returns {Promise<number>}
 */
RPC.prototype.getBlockCount = async function () {
    return this.call('getblockcount', ...(Array.from(arguments)));
}

/**
 * Returns hash of block in best-block-chain at height provided.
 * @param {number} height
 * @returns {Promise<string>}
 */
RPC.prototype.getBlockHash = async function (height) {
    return this.call('getblockhash', ...(Array.from(arguments)));
}

/**
 * If verbose is false, returns a string that is serialized, hex-encoded data for blockheader ‘hash’.
 * If verbose is true, returns an Object with information about blockheader ‘hash’.
 * @param {string} blockhash
 * @param {boolean} verbose
 * @returns {Promise<{bits:string, chainwork:string, confirmations:number, difficulty:number, hash:string, height:number, mediantime:number, merkleroot:string, nTx:number, nextblockhash:string, nonce:number, previousblockhash:string, time:number, version:number, versionHex:string}>}
 */
RPC.prototype.getBlockHeader = async function (blockhash, verbose) {
    return this.call('getblockheader', ...(Array.from(arguments)));
}

/**
 * Compute per block statistics for a given window. All amounts are in satoshis.
 * It won’t work for some heights with pruning.
 * @param {string|numeric} blockhash_or_height
 * @param {Array} stats
 * @returns {Promise<{avgfee:number, avgfeerate:number, avgtxsize:number, blockhash:string, feerate_percentiles:number[], height:number, ins:number, maxfee:number, maxfeerate:number, maxtxsize:number, medianfee:number, mediantime:number, mediantxsize:number, minfee:number, minfeerate:number, mintxsize:number, outs:number, subsidy:number, swtotal_size:number, swtotal_weight:number, swtxs:number, time:number, total_out:number, total_size:number, total_weight:number, totalfee:number, txs:number, utxo_increase:number, utxo_size_inc:number}>}
 */
RPC.prototype.getBlockStats = async function (blockhash_or_height, stats) {
    return this.call('getblockstats', ...(Array.from(arguments)));
}

/**
 * Return information about all known tips in the block tree, including the main chain as well as orphaned branches.
 * @returns {Promise<>}
 */
RPC.prototype.getChainTips = async function () {
    // CHECK
    return this.call('getchaintips', ...(Array.from(arguments)));
}

/**
 * Compute statistics about the total number and rate of transactions in the chain.
 * @param {number} nblocks
 * @param {string} blockhash
 * @returns {Promise<{time:number, txcount:number, txrate:number, window_block_count:number, window_final_block_hash:string, window_interval:number, window_tx_count:number}>}
 */
RPC.prototype.getChainTxStats = async function (nblocks, blockhash) {
    return this.call('getchaintxstats', ...(Array.from(arguments)));
}

/**
 * Returns the proof-of-work difficulty as a multiple of the minimum difficulty.
 * @returns {Promise<number>}
 */
RPC.prototype.getDifficulty = async function () {
    return this.call('getdifficulty', ...(Array.from(arguments)));
}

/**
 * If txid is in the mempool, returns all in-mempool ancestors.
 * @param {string} txid
 * @param {boolean} verbose
 * @returns {Promise<>}
 */
RPC.prototype.getMempoolAncestors = async function (txid, verbose) {
    return this.call('getmempoolancestors', ...(Array.from(arguments)));
}

/**
 * If txid is in the mempool, returns all in-mempool descendants.
 * @param {string} txid
 * @param {boolean} verbose
 * @returns {Promise<>}
 */
RPC.prototype.getMempoolDescendants = async function (txid, verbose) {
    return this.call('getmempooldescendants', ...(Array.from(arguments)));
}

/**
 * Returns mempool data for given transaction.
 * @param {string} txid
 * @returns {Promise<>}
 */
RPC.prototype.getMempoolEntry = async function (txid) {
    return this.call('getmempoolentry', ...(Array.from(arguments)));
}

/**
 * Returns details on the active state of the TX memory pool.
 * @returns {Promise<{bytes:number, maxmempool:number, mempoolminfee:number, minrelaytxfee:number, size:number, usage:number}>}
 */
RPC.prototype.getMempoolInfo = async function () {
    return this.call('getmempoolinfo', ...(Array.from(arguments)));
}

/**
 * Returns all transaction ids in memory pool as a json array of string transaction ids.
 * Hint: use getmempoolentry to fetch a specific transaction from the mempool.
 * @param {boolean} verbose
 * @param {boolean} mempool_sequence
 * @returns {Promise<Array<string>>}
 */
RPC.prototype.getRawMempool = async function (verbose, mempool_sequence) {
    return this.call('getrawmempool', ...(Array.from(arguments)));
}

/**
 * Returns details about an unspent transaction output.
 * @param {string} txid
 * @param {number} n
 * @param {boolean} mempool
 * @returns {Promise<>}
 */
RPC.prototype.getTxOut = async function (txid, n, include_mempool) {
    return this.call('gettxout', ...(Array.from(arguments)));
}

/**
 * Returns a hex-encoded proof that “txid” was included in a block.
 * NOTE: By default this function only works sometimes. This is when there is an unspent output in the utxo for this transaction. To make it always work, you need to maintain a transaction index, using the -txindex command line option or specify the block in which the transaction is included manually (by blockhash).
 * @param {Array<string>} txids
 * @param {string} blockhash
 * @returns {Promise<>}
 */
RPC.prototype.getTxOutProof = async function (txids, blockhash) {
    return this.call('gettxoutproof', ...(Array.from(arguments)));
}

/**
 * Returns statistics about the unspent transaction output set.
 * Note this call may take some time.
 * @param {string} hash_type
 * @returns {Promise<>}
 */
RPC.prototype.getTxOutSetInfo = async function (hash_type) {
    return this.call('gettxoutsetinfo', ...(Array.from(arguments)));
}

/**
 * Treats a block as if it were received before others with the same work.
 * A later preciousblock call can override the effect of an earlier one.
 * The effects of preciousblock are not retained across restarts.
 * @param {string} blockhash
 * @returns {Promise<>}
 */
RPC.prototype.preciousBlock = async function (blockhash) {
    return this.call('preciousblock', ...(Array.from(arguments)));
}

/**
 * The block height to prune up to. May be set to a discrete height, or to a UNIX epoch time
 * to prune blocks whose block time is at least 2 hours older than the provided timestamp.
 * @param {number} height
 * @returns {Promise<>}
 */
RPC.prototype.pruneBlockChain = async function (height) {
    return this.call('pruneblockchain', ...(Array.from(arguments)));
}

/**
 * Dumps the mempool to disk. It will fail until the previous dump is fully loaded.
 * @returns {Promise<>}
 */
RPC.prototype.saveMempool = async function () {
    return this.call('savemempool', ...(Array.from(arguments)));
}

/**
 * Scans the unspent transaction output set for entries that match certain output descriptors.
 * @param {string} action
 * @param {Array} scanobjects
 * @returns {Promise<>}
 */
RPC.prototype.scanTxOutSet = async function (action, scanobjects) {
    return this.call('scantxoutset', ...(Array.from(arguments)));
}

/**
 * Verifies blockchain database.
 * How thorough the block verification is:
 * level 0 reads the blocks from disk
 * level 1 verifies block validity
 * level 2 verifies undo data
 * level 3 checks disconnection of tip blocks
 * level 4 tries to reconnect the blocks
 * each level includes the checks of the previous levels
 * @param {number} checklevel
 * @param {number} nblocks
 * @returns {Promise<>}
 */
RPC.prototype.verifyChain = async function (checklevel, nblocks) {
    return this.call('verifychain', ...(Array.from(arguments)));
}

/**
 * Verifies that a proof points to a transaction in a block, returning the transaction it commits to and throwing an RPC error if the block is not in our best chain.
 * @param {string} proof
 * @returns {Promise<>}
 */
RPC.prototype.verifyTxOutProof = async function (proof) {
    return this.call('verifytxoutproof', ...(Array.from(arguments)));
}



/**
 * Control RPCs
 */

/**
 * Returns an object containing information about memory usage.
 * @param {string} mode
 * @returns {Promise<>}
 */
RPC.prototype.getMemoryInfo = async function (mode) {
    return this.call('getmemoryinfo', ...(Array.from(arguments)));
}

/**
 * List all commands, or get help for a specified command.
 * @param {string} command
 * @returns {Promise<>}
 */
RPC.prototype.help = async function (command) {
    return this.call('help', ...(Array.from(arguments)));
}

/**
 * Gets and sets the logging configuration.
 * When called without an argument, returns the list of categories with status that are currently being debug logged or not.
 * When called with arguments, adds or removes categories from debug logging and return the lists above.
 * The arguments are evaluated in order “include”, “exclude”.
 * If an item is both included and excluded, it will thus end up being excluded.
 * @param {Array} include
 * @param {Array} exclude
 * @returns {Promise<>}
 */
RPC.prototype.logging = async function (include, exclude) {
    return this.call('logging', ...(Array.from(arguments)));
}

/**
 * Request a graceful shutdown of DigiByte Core.
 * @returns {Promise<>}
 */
RPC.prototype.stop = async function () {
    return this.call('stop', ...(Array.from(arguments)));
}

/**
 * Returns the total uptime of the server.
 * @returns {Promise<number>}
 */
RPC.prototype.upTime = async function () {
    return this.call('uptime', ...(Array.from(arguments)));
}



/**
 * Generating RPCs
 */

/**
 * Mine a block with a set of ordered transactions immediately to a specified address or descriptor (before the RPC call returns)
 * @param {string} output
 * @param {Array<string>} transactions
 * @returns {Promise<>}
 */
RPC.prototype.generate = async function (output, transactions) {
    return this.call('generate', ...(Array.from(arguments)));
}

/**
 * Mine blocks immediately to a specified address (before the RPC call returns)
 * @param {number} nblocks
 * @param {string} address
 * @param {number} maxtries
 * @returns {Promise<>}
 */
RPC.prototype.generateToAddress = async function (nblocks, address, maxtries) {
    return this.call('generatetoaddress', ...(Array.from(arguments)));
}



/**
 * Mining RPCs
 */

/**
 * If the request parameters include a ‘mode’ key, that is used to explicitly select between the default ‘template’ request or a ‘proposal’.
 * It returns data needed to construct a block to work on.
 * @param {Object} template_request
 * @returns {Promise<>}
 */
RPC.prototype.getBlockTemplate = async function (template_request) {
    return this.call('getblocktemplate', ...(Array.from(arguments)));
}

/**
 * Returns a json object containing mining-related information.
 * @returns {Promise<>}
 */
RPC.prototype.getMiningInfo = async function () {
    return this.call('getmininginfo', ...(Array.from(arguments)));
}

/**
 * Returns the estimated network hashes per second based on the last n blocks.
 * Pass in [blocks] to override # of blocks, -1 specifies since last difficulty change.
 * Pass in [height] to estimate the network speed at the time when a certain block was found.
 * @param {number} nblocks
 * @param {number} height
 * @returns {Promise<>}
 */
RPC.prototype.getNetworkHashPs = async function (nblocks, height) {
    return this.call('getnetworkhashps', ...(Array.from(arguments)));
}

/**
 * Accepts the transaction into mined blocks at a higher (or lower) priority.
 * @param {string} txid
 * @param {number} dummy
 * @param {number} fee_delta
 * @returns {Promise<>}
 */
RPC.prototype.prioritiseTransaction = async function (txid, dummy, fee_delta) {
    return this.call('prioritisetransaction', ...(Array.from(arguments)));
}

/**
 * Attempts to submit new block to network.
 * @param {string} hexdata
 * @param {string} dummy
 * @returns {Promise<>}
 */
RPC.prototype.submitBlock = async function (hexdata, dummy) {
    return this.call('submitblock', ...(Array.from(arguments)));
}



/**
 * Network RPCs
 */

/**
 * Attempts to add or remove a node from the addnode list.
 * Or try a connection to a node once.
 * Nodes added using addnode (or -connect) are protected from DoS disconnection and are not required to be full nodes/support SegWit as other outbound peers are (though such peers will not be synced from).
 * @param {string} node
 * @param {"add"|"remove"|"onetry"} command
 * @returns {Promise<>}
 */
RPC.prototype.addNode = async function (node, command) {
    return this.call('addnode', ...(Array.from(arguments)));
}

/**
 * Clear all banned IPs.
 * @returns {Promise<>}
 */
RPC.prototype.clearBanned = async function () {
    return this.call('clearbanned', ...(Array.from(arguments)));
}

/**
 * Immediately disconnects from the specified peer node.
 * Strictly one out of ‘address’ and ‘nodeid’ can be provided to identify the node.
 * To disconnect by nodeid, either set ‘address’ to the empty string, or call using the named ‘nodeid’ argument only.
 * @param {string} address
 * @param {number} nodeid
 * @returns {Promise<>}
 */
RPC.prototype.disconnectNode = async function (address, nodeid) {
    return this.call('disconnectnode', ...(Array.from(arguments)));
}

/**
 * Returns information about the given added node, or all added nodes (note that onetry addnodes are not listed here).
 * @param {string} node
 * @returns {Promise<>}
 */
RPC.prototype.getAddedNodeInfo = async function (node) {
    return this.call('getaddednodeinfo', ...(Array.from(arguments)));
}

/**
 * Returns the number of connections to other nodes.
 * @returns {Promise<>}
 */
RPC.prototype.getConnectionCount = async function () {
    return this.call('getconnectioncount', ...(Array.from(arguments)));
}

/**
 * Returns information about network traffic, including bytes in, bytes out, and current time.
 * @returns {Promise<>}
 */
RPC.prototype.getNetTotals = async function () {
    return this.call('getnettotals', ...(Array.from(arguments)));
}

/**
 * Returns an object containing various state info regarding P2P networking.
 * @returns {Promise<>}
 */
RPC.prototype.getNetworkInfo = async function () {
    return this.call('getnetworkinfo', ...(Array.from(arguments)));
}

/**
 * Returns data about each connected network node as a json array of objects.
 * @returns {Promise<>}
 */
RPC.prototype.getPeerInfo = async function () {
    return this.call('getpeerinfo', ...(Array.from(arguments)));
}

/**
 * List all manually banned IPs/Subnets.
 * @returns {Promise<>}
 */
RPC.prototype.listBanned = async function () {
    return this.call('listbanned', ...(Array.from(arguments)));
}

/**
 * Requests that a ping be sent to all other nodes, to measure ping time.
 * Results provided in getpeerinfo, pingtime and pingwait fields are decimal seconds.
 * Ping command is handled in queue with all other commands, so it measures processing backlog, not just network ping.
 * @returns {Promise<>}
 */
RPC.prototype.ping = async function () {
    return this.call('ping', ...(Array.from(arguments)));
}

/**
 * Attempts to add or remove an IP/Subnet from the banned list.
 * @param {string} subnet
 * @param {"add"|"remove"} command
 * @param {number} bantime
 * @param {boolean} absolute
 * @returns {Promise<>}
 */
RPC.prototype.setBan = async function (subnet, command, bantime, absolute) {
    return this.call('setban', ...(Array.from(arguments)));
}

/**
 * Disable/enable all p2p network activity.
 * @param {boolean} state
 * @returns {Promise<>}
 */
RPC.prototype.setNetworkActive = async function (state) {
    return this.call('setnetworkactive', ...(Array.from(arguments)));
}



/**
 * Raw Transactions RPCs
 */

/**
 * Combine multiple partially signed Bitcoin transactions into one transaction.
 * Implements the Combiner role.
 * @param {Array} txs
 * @returns {Promise<>}
 */
RPC.prototype.combinePsbt = async function (txs) {
    return this.call('combinepsbt', ...(Array.from(arguments)));
}

/**
 * Combine multiple partially signed transactions into one transaction.
 * The combined transaction may be another partially signed transaction or a fully signed transaction.
 * @param {Array} txs
 * @returns {Promise<>}
 */
RPC.prototype.combineRawTransaction = async function (txs) {
    return this.call('combinerawtransaction', ...(Array.from(arguments)));
}

/**
 * Converts a network serialized transaction to a PSBT. This should be used only with createrawtransaction and fundrawtransaction createpsbt and walletcreatefundedpsbt should be used for new applications.
 * @param {string} hexstring
 * @param {boolean} permitsigdata
 * @param {boolean} iswitness
 * @returns {Promise<>}
 */
RPC.prototype.convertToPsbt = async function (hexstring, permitsigdata, iswitness) {
    return this.call('converttopsbt', ...(Array.from(arguments)));
}

/**
 * Creates a transaction in the Partially Signed Transaction format.
 * Implements the Creator role.
 * @param {Array} inputs
 * @param {Array} outputs
 * @param {number} locktime
 * @param {boolean} replaceable
 * @returns {Promise<>}
 */
RPC.prototype.createPsbt = async function (inputs, outputs, locktime, replaceable) {
    return this.call('createpsbt', ...(Array.from(arguments)));
}

/**
 * Create a transaction spending the given inputs and creating new outputs.
 * Outputs can be addresses or data.
 * Returns hex-encoded raw transaction.
 * Note that the transaction’s inputs are not signed, and it is not stored in the wallet or transmitted to the network.
 * @param {Array} inputs
 * @param {Array} outputs
 * @param {number} locktime
 * @param {boolean} replaceable
 * @returns {Promise<>}
 */
RPC.prototype.createRawTransaction = async function (inputs, outputs, locktime, replaceable) {
    return this.call('createrawtransaction', ...(Array.from(arguments)));
}

/**
 * Return a JSON object representing the serialized, base64-encoded partially signed Bitcoin transaction.
 * @param {string} psbt
 * @returns {Promise<>}
 */
RPC.prototype.decodePsbt = async function (psbt) {
    return this.call('decodepsbt', ...(Array.from(arguments)));
}

/**
 * Return a JSON object representing the serialized, hex-encoded transaction.
 * @param {string} hexstring
 * @param {boolean} iswitness
 * @returns {Promise<>}
 */
RPC.prototype.decodeRawTransaction = async function (hexstring, iswitness) {
    return this.call('decoderawtransaction', ...(Array.from(arguments)));
}

/**
 * Decode a hex-encoded script.
 * @param {string} hexstring
 * @returns {Promise<>}
 */
RPC.prototype.decodeScript = async function (hexstring) {
    return this.call('decodescript', ...(Array.from(arguments)));
}

/**
 * Finalize the inputs of a PSBT. If the transaction is fully signed, it will produce a network serialized transaction which can be broadcast with sendrawtransaction. Otherwise a PSBT will be created which has the final_scriptSig and final_scriptWitness fields filled for inputs that are complete.
 * Implements the Finalizer and Extractor roles.
 * @param {string} psbt
 * @param {boolean} extract
 * @returns {Promise<>}
 */
RPC.prototype.finalizePsbt = async function (psbt, extract) {
    return this.call('finalizepsbt', ...(Array.from(arguments)));
}

/**
 * If the transaction has no inputs, they will be automatically selected to meet its out value.
 * It will add at most one change output to the outputs.
 * No existing outputs will be modified unless “subtractFeeFromOutputs” is specified.
 * Note that inputs which were signed may need to be resigned after completion since in/outputs have been added.
 * The inputs added will not be signed, use signrawtransactionwithkey or signrawtransactionwithwallet for that.
 * Note that all existing inputs must have their previous output transaction be in the wallet.
 * Note that all inputs selected must be of standard form and P2SH scripts must be in the wallet using importaddress or addmultisigaddress (to calculate fees).
 * You can see whether this is the case by checking the “solvable” field in the listunspent output.
 * Only pay-to-pubkey, multisig, and P2SH versions thereof are currently supported for watch-only
 * @param {string} hexstring
 * @param {Object} options
 * @returns {Promise<>}
 */
RPC.prototype.fundRawTransaction = async function (hexstring, options) {
    return this.call('fundrawtransaction', ...(Array.from(arguments)));
}

/**
 * Return the raw transaction data.
 * By default this function only works for mempool transactions. When called with a blockhash argument, getrawtransaction will return the transaction if the specified block is available and the transaction is found in that block. When called without a blockhash argument, getrawtransaction will return the transaction if it is in the mempool, or if -txindex is enabled and the transaction is in a block in the blockchain.
 * Hint: Use gettransaction for wallet transactions.
 * If verbose is ‘true’, returns an Object with information about ‘txid’.
 * If verbose is ‘false’ or omitted, returns a string that is serialized, hex-encoded data for ‘txid’.
 * @param {string} txid
 * @param {boolean} verbose
 * @param {string} blockhash
 * @returns {Promise<>}
 */
RPC.prototype.getRawTransaction = async function (txid, verbose, blockhash) {
    return this.call('getrawtransaction', ...(Array.from(arguments)));
}

/**
 * Submit a raw transaction (serialized, hex-encoded) to local node and network.
 * Note that the transaction will be sent unconditionally to all peers, so using this for manual rebroadcast may degrade privacy by leaking the transaction’s origin, as nodes will normally not rebroadcast non-wallet transactions already in their mempool.
 * Also see createrawtransaction and signrawtransactionwithkey calls.
 * @param {string} hexstring
 * @param {numeric} maxfeerate
 * @returns {Promise<>}
 */
RPC.prototype.sendRawTransaction = async function (hexstring, maxfeerate) {
    return this.call('sendrawtransaction', ...(Array.from(arguments)));
}

/**
 * Sign inputs for raw transaction (serialized, hex-encoded).
 * The second argument is an array of base58-encoded private keys that will be the only keys used to sign the transaction.
 * The third optional argument (may be null) is an array of previous transaction outputs that this transaction depends on but may not yet be in the block chain.
 * @param {string} hexstring
 * @param {Array} privkeys
 * @param {Array} prevtxs
 * @param {string} sighashtype
 * @returns {Promise<>}
 */
RPC.prototype.signRawTransactionWithKey = async function (hexstring, privkeys, prevtxs, sighashtype) {
    return this.call('signrawtransactionwithkey', ...(Array.from(arguments)));
}

/**
 * Returns result of mempool acceptance tests indicating if raw transaction (serialized, hex-encoded) would be accepted by mempool.
 * This checks if the transaction violates the consensus or policy rules.
 * See sendrawtransaction call.
 * @param {Array<string>} rawtxs
 * @param {number} maxfeerate
 * @returns {Promise<>}
 */
RPC.prototype.testMempoolAccept = async function (rawtxs, maxfeerate) {
    return this.call('testmempoolaccept', ...(Array.from(arguments)));
}



/**
 * Util RPCs
 */

/**
 * Creates a multi-signature address with n signature of m keys required.
 * It returns a json object with the address and redeemScript.
 * @param {number} nrequired
 * @param {Array} keys
 * @param {string} address_type
 * @returns {Promise<>}
 */
RPC.prototype.createMultisig = async function (nrequired, keys, address_type) {
    return this.call('createmultisig', ...(Array.from(arguments)));
}

/**
 * Estimates the approximate fee per kilobyte needed for a transaction to begin confirmation within conf_target blocks if possible and return the number of blocks for which the estimate is valid. Uses virtual transaction size as defined in BIP 141 (witness data is discounted).
 * @param {number} conf_target
 * @param {string} estimate_mode
 * @returns {Promise<>}
 */
RPC.prototype.estimateSmartFee = async function (conf_target, estimate_mode) {
    return this.call('estimatesmartfee', ...(Array.from(arguments)));
}

/**
 * Sign a message with the private key of an address.
 * @param {string} privkey
 * @param {string} message
 * @returns {Promise<>}
 */
RPC.prototype.signMessageWithPrivKey = async function (privkey, message) {
    return this.call('signmessagewithprivkey', ...(Array.from(arguments)));
}

/**
 * Return information about the given bitcoin address.
 * @returns {Promise<>}
 */
RPC.prototype.validateAddress = async function (address) {
    return this.call('validateaddress', ...(Array.from(arguments)));
}

/**
 * Verify a signed message.
 * @param {string} address
 * @param {string} signature
 * @param {string} message
 * @returns {Promise<>}
 */
RPC.prototype.verifyMessage = async function (address, signature, message) {
    return this.call('verifymessage', ...(Array.from(arguments)));
}



/**
 * Wallet RPCs
 */

/**
 * Mark in-wallet transaction <txid> as abandoned This will mark this transaction and all its in-wallet descendants as abandoned which will allow for their inputs to be respent. It can be used to replace “stuck” or evicted transactions.
 * It only works on transactions which are not included in a block and are not currently in the mempool.
 * It has no effect on transactions which are already abandoned.
 * @param {string} txid
 * @returns {Promise<>}
 */
RPC.prototype.abandonTransaction = async function (txid) {
    return this.call('abandontransaction', ...(Array.from(arguments)));
}

/**
 * Stops current wallet rescan triggered by an RPC call, e.g. by an importprivkey call.
 * Note: Use “getwalletinfo” to query the scanning progress.
 * @returns {Promise<>}
 */
RPC.prototype.abortRescan = async function () {
    return this.call('abortrescan', ...(Array.from(arguments)));
}

/**
 * Add an nrequired-to-sign multisignature address to the wallet. Requires a new wallet backup.
 * Each key is a Bitcoin address or hex-encoded public key.
 * This functionality is only intended for use with non-watchonly addresses.
 * See importaddress for watchonly p2sh address support.
 * If ‘label’ is specified, assign address to that label.
 * @param {number} nrequired
 * @param {Array} keys
 * @param {string} label
 * @param {string} address_type
 * @returns {Promise<>}
 */
RPC.prototype.addMultisigAddress = async function (nrequired, keys, label, address_type) {
    return this.call('addmultisigaddress', ...(Array.from(arguments)));
}

/**
 * Safely copies current wallet file to destination, which can be a directory or a path with filename.
 * @param {string} destination
 * @returns {Promise<>}
 */
RPC.prototype.backupWallet = async function (destination) {
    return this.call('backupwallet', ...(Array.from(arguments)));
}

/**
 * Bumps the fee of an opt-in-RBF transaction T, replacing it with a new transaction B.
 * An opt-in RBF transaction with the given txid must be in the wallet.
 * The command will pay the additional fee by reducing change outputs or adding inputs when necessary.
 * It may add a new change output if one does not already exist.
 * All inputs in the original transaction will be included in the replacement transaction.
 * The command will fail if the wallet or mempool contains a transaction that spends one of T’s outputs.
 * By default, the new fee will be calculated automatically using the estimatesmartfee RPC.
 * The user can specify a confirmation target for estimatesmartfee.
 * Alternatively, the user can specify a fee rate in sat/vB for the new transaction.
 * At a minimum, the new fee rate must be high enough to pay an additional new relay fee (incrementalfee returned by getnetworkinfo) to enter the node’s mempool.
 * @param {string} txid
 * @param {Array} options
 * @returns {Promise<>}
 */
RPC.prototype.bumpFee = async function (txid, options) {
    return this.call('bumpfee', ...(Array.from(arguments)));
}

/**
 * Creates and loads a new wallet.
 * @param {string} wallet_name
 * @param {boolean} disable_private_keys
 * @param {boolean} blank
 * @param {string} passphrase
 * @param {boolean} avoid_reuse
 * @param {boolean} descriptors
 * @param {boolean} load_on_startup
 * @returns {Promise<>}
 */
RPC.prototype.createWallet = async function (wallet_name, disable_private_keys, blank, passphrase, avoid_reuse, descriptors, load_on_startup) {
    return this.call('createwallet', ...(Array.from(arguments)));
}

/**
 * Reveals the private key corresponding to ‘address’.
 * Then the importprivkey can be used with this output.
 * @param {string} address
 * @returns {Promise<>}
 */
RPC.prototype.dumpPrivKey = async function (address) {
    return this.call('dumpprivkey', ...(Array.from(arguments)));
}

/**
 * Dumps all wallet keys in a human-readable format to a server-side file. This does not allow overwriting existing files.
 * Imported scripts are included in the dumpfile, but corresponding BIP173 addresses, etc. may not be added automatically by importwallet.
 * Note that if your wallet contains keys which are not derived from your HD seed (e.g. imported keys), these are not covered by only backing up the seed itself, and must be backed up too (e.g. ensure you back up the whole dumpfile).
 * @param {string} filename
 * @returns {Promise<>}
 */
RPC.prototype.dumpWallet = async function (filename) {
    return this.call('dumpwallet', ...(Array.from(arguments)));
}

/**
 * Encrypts the wallet with ‘passphrase’. This is for first time encryption.
 * After this, any calls that interact with private keys such as sending or signing will require the passphrase to be set prior the making these calls.
 * Use the walletpassphrase call for this, and then walletlock call.
 * If the wallet is already encrypted, use the walletpassphrasechange call.
 * @param {string} passphrase
 * @returns {Promise<>}
 */
RPC.prototype.encryptWallet = async function (passphrase) {
    return this.call('encryptwallet', ...(Array.from(arguments)));
}

/**
 * Returns the list of addresses assigned the specified label.
 * @param {string} label
 * @returns {Promise<>}
 */
RPC.prototype.getAddressesByLabel = async function (label) {
    return this.call('getaddressesbylabel', ...(Array.from(arguments)));
}

/**
 * Return information about the given bitcoin address.
 * Some of the information will only be present if the address is in the active wallet.
 * @param {string} address
 * @returns {Promise<>}
 */
RPC.prototype.getAddressInfo = async function (address) {
    return this.call('getaddressinfo', ...(Array.from(arguments)));
}

/**
 * Returns the total available balance.
 * @param {string} dummy 
 * @param {number} minconf
 * @param {boolean} include_watchonly
 * @param {boolean} avoid_reuse
 * @returns {Promise<>}
 */
RPC.prototype.getBalance = async function (dummy, minconf, include_watchonly, avoid_reuse) {
    return this.call('getbalance', ...(Array.from(arguments)));
}

/**
 * Returns a new DigiByte address for receiving payments.
 * If ‘label’ is specified, it is added to the address book so payments received with the address will be associated with ‘label’.
 * @param {string} label
 * @param {string} address_type
 * @returns {Promise<>}
 */
RPC.prototype.getNewAddress = async function (label, address_type) {
    return this.call('getnewaddress', ...(Array.from(arguments)));
}

/**
 * Returns a new DigiByte address, for receiving change.
 * This is for use with raw transactions, NOT normal use.
 * @param {string} address_type
 * @returns {Promise<>}
 */
RPC.prototype.getRawChangeAddress = async function (address_type) {
    return this.call('getrawchangeaddress', ...(Array.from(arguments)));
}

/**
 * Returns the total amount received by the given address in transactions with at least minconf confirmations.
 * @param {string} address
 * @param {number} minconf
 * @returns {Promise<>}
 */
RPC.prototype.getReceivedByAddress = async function (address, minconf) {
    return this.call('getreceivedbyaddress', ...(Array.from(arguments)));
}

/**
 * Returns the total amount received by addresses with <label> in transactions with at least [minconf] confirmations.
 * @param {string} label
 * @param {number} minconf
 * @returns {Promise<>}
 */
RPC.prototype.getReceivedByLabel = async function (label, minconf) {
    return this.call('getreceivedbylabel', ...(Array.from(arguments)));
}

/**
 * Get detailed information about in-wallet transaction <txid>
 * @param {string} txid
 * @param {boolean} include_watchonly
 * @param {boolean} verbose
 * @returns {Promise<>}
 */
RPC.prototype.getTransaction = async function (txid, include_watchonly, verbose) {
    return this.call('gettransaction', ...(Array.from(arguments)));
}

/**
 * Returns an object containing various wallet state info.
 * @returns {Promise<>}
 */
RPC.prototype.getWalletInfo = async function () {
    return this.call('getwalletinfo', ...(Array.from(arguments)));
}

/**
 * Adds an address or script (in hex) that can be watched as if it were in your wallet but cannot be used to spend. Requires a new wallet backup.
 * Note: This call can take over an hour to complete if rescan is true, during that time, other rpc calls may report that the imported address exists but related transactions are still missing, leading to temporarily incorrect/bogus balances and unspent outputs until rescan completes.
 * If you have the full public key, you should call importpubkey instead of this.
 * Hint: use importmulti to import more than one address.
 * Note: If you import a non-standard raw script in hex form, outputs sending to it will be treated as change, and not show up in many RPCs.
 * Note: Use “getwalletinfo” to query the scanning progress.
 * @param {string} address
 * @param {string} label
 * @param {boolean} rescan
 * @param {boolean} p2sh
 * @returns {Promise<>}
 */
RPC.prototype.importAddress = async function (address, label, rescan, p2sh) {
    return this.call('importaddress', ...(Array.from(arguments)));
}

/**
 * Import addresses/scripts (with private or public keys, redeem script (P2SH)), optionally rescanning the blockchain from the earliest creation time of the imported scripts. Requires a new wallet backup.
 * If an address/script is imported without all of the private keys required to spend from that address, it will be watchonly. The ‘watchonly’ option must be set to true in this case or a warning will be returned.
 * Conversely, if all the private keys are provided and the address/script is spendable, the watchonly option must be set to false, or a warning will be returned.
 * Note: This call can take over an hour to complete if rescan is true, during that time, other rpc calls may report that the imported keys, addresses or scripts exist but related transactions are still missing.
 * Note: Use “getwalletinfo” to query the scanning progress.
 * @param {Array} requests
 * @param {Object} options
 * @returns {Promise<>}
 */
RPC.prototype.importMulti = async function (requests, options) {
    return this.call('importmulti', ...(Array.from(arguments)));
}

/**
 * Adds a private key (as returned by dumpprivkey) to your wallet. Requires a new wallet backup.
 * Hint: use importmulti to import more than one private key.
 * Note: This call can take over an hour to complete if rescan is true, during that time, other rpc calls may report that the imported key exists but related transactions are still missing, leading to temporarily incorrect/bogus balances and unspent outputs until rescan completes.
 * Note: Use “getwalletinfo” to query the scanning progress.
 * @param {string} privkey
 * @param {string} label
 * @param {boolean} rescan
 * @returns {Promise<>}
 */
RPC.prototype.importPrivKey = async function (privkey, label, rescan) {
    return this.call('importprivkey', ...(Array.from(arguments)));
}

/**
 * Imports funds without rescan. Corresponding address or script must previously be included in wallet. Aimed towards pruned wallets. The end-user is responsible to import additional transactions that subsequently spend the imported outputs or rescan after the point in the blockchain the transaction is included.
 * @param {string} rawtransaction
 * @param {string} txoutproof
 * @returns {Promise<>}
 */
RPC.prototype.importPrunedFunds = async function (rawtransaction, txoutproof) {
    return this.call('importprunedfunds', ...(Array.from(arguments)));
}

/**
 * Adds a public key (in hex) that can be watched as if it were in your wallet but cannot be used to spend. Requires a new wallet backup.
 * Hint: use importmulti to import more than one public key.
 * Note: This call can take over an hour to complete if rescan is true, during that time, other rpc calls may report that the imported pubkey exists but related transactions are still missing, leading to temporarily incorrect/bogus balances and unspent outputs until rescan completes.
 * Note: Use “getwalletinfo” to query the scanning progress.
 * @param {string} pubkey
 * @param {string} label
 * @param {boolean} rescan
 * @returns {Promise<>}
 */
RPC.prototype.importPubKey = async function (pubkey, label, rescan) {
    return this.call('importpubkey', ...(Array.from(arguments)));
}

/**
 * Imports keys from a wallet dump file (see dumpwallet). Requires a new wallet backup to include imported keys.
 * Note: Use “getwalletinfo” to query the scanning progress.
 * @param {string} filename
 * @returns {Promise<>}
 */
RPC.prototype.importWallet = async function (filename) {
    return this.call('importwallet', ...(Array.from(arguments)));
}

/**
 * Fills the keypool.
 * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
 * @param {number} newsize
 * @returns {Promise<>}
 */
RPC.prototype.keyPoolRefill = async function (newsize) {
    return this.call('keypoolrefill', ...(Array.from(arguments)));
}

/**
 * Lists groups of addresses which have had their common ownership made public by common use as inputs or as the resulting change in past transactions
 * @returns {Promise<>}
 */
RPC.prototype.listAddressGroupings = async function () {
    return this.call('listaddressgroupings', ...(Array.from(arguments)));
}

/**
 * Returns the list of all labels, or labels that are assigned to addresses with a specific purpose.
 * @param {string} purpose
 * @returns {Promise<>}
 */
RPC.prototype.listLabels = async function (purpose) {
    return this.call('listlabels', ...(Array.from(arguments)));
}

/**
 * Returns list of temporarily unspendable outputs.
 * See the lockunspent call to lock and unlock transactions for spending.
 * @returns {Promise<>}
 */
RPC.prototype.listLockUnspent = async function () {
    return this.call('listlockunspent', ...(Array.from(arguments)));
}

/**
 * List balances by receiving address
 * @param {number} minconf
 * @param {boolean} include_empty
 * @param {boolean} include_watchonly
 * @param {string} address_filter
 * @returns {Promise<>}
 */
RPC.prototype.listReceivedByAddress = async function (minconf, include_empty, include_watchonly, address_filter) {
    return this.call('listreceivedbyaddress', ...(Array.from(arguments)));
}

/**
 * List received transactions by label.
 * @param {number} minconf
 * @param {boolean} include_empty
 * @param {boolean} include_watchonly
 * @returns {Promise<>}
 */
RPC.prototype.listReceivedByLabel = async function (minconf, include_empty, include_watchonly) {
    return this.call('listreceivedbylabel', ...(Array.from(arguments)));
}

/**
 * Get all transactions in blocks since block [blockhash], or all transactions if omitted.
 * If “blockhash” is no longer a part of the main chain, transactions from the fork point onward are included.
 * Additionally, if include_removed is set, transactions affecting the wallet which were removed are returned in the “removed” array.
 * @param {string} blockhash
 * @param {number} target_confirmations
 * @param {boolean} include_watchonly
 * @param {boolean} include_removed
 * @returns {Promise<>}
 */
RPC.prototype.listSinceBlock = async function (blockhash, target_confirmations, include_watchonly, include_removed) {
    return this.call('listsinceblock', ...(Array.from(arguments)));
}

/**
 * If a label name is provided, this will return only incoming transactions paying to addresses with the specified label.
 * Returns up to ‘count’ most recent transactions skipping the first ‘from’ transactions.
 * @param {string} label
 * @param {number} count
 * @param {number} skip
 * @param {boolean} include_watchonly
 * @returns {Promise<>}
 */
RPC.prototype.listTransactions = async function (label, count, skip, include_watchonly) {
    return this.call('listtransactions', ...(Array.from(arguments)));
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
 * Returns a list of currently loaded wallets.
 * For full information on the wallet, use “getwalletinfo”
 * @returns {Promise<>}
 */
RPC.prototype.listWallets = async function () {
    return this.call('listwallets', ...(Array.from(arguments)));
}

/**
 * Loads a wallet from a wallet file or directory.
 * Note that all wallet command-line options used when starting bitcoind will be applied to the new wallet (eg -rescan, etc).
 * @param {string} filename
 * @param {boolean} load_on_startup
 * @returns {Promise<>}
 */
RPC.prototype.loadWallet = async function (filename, load_on_startup) {
    return this.call('loadwallet', ...(Array.from(arguments)));
}

/**
 * Updates list of temporarily unspendable outputs.
 * Temporarily lock (unlock=false) or unlock (unlock=true) specified transaction outputs.
 * If no transaction outputs are specified when unlocking then all current locked transaction outputs are unlocked.
 * A locked transaction output will not be chosen by automatic coin selection, when spending bitcoins.
 * Manually selected coins are automatically unlocked.
 * Locks are stored in memory only. Nodes start with zero locked outputs, and the locked output list is always cleared (by virtue of process exit) when a node stops or fails.
 * Also see the listunspent call.
 * @param {boolean} unlock
 * @param {Array} transactions
 * @returns {Promise<>}
 */
RPC.prototype.lockUnspent = async function (unlock, transactions) {
    return this.call('lockunspent', ...(Array.from(arguments)));
}

/**
 * Deletes the specified transaction from the wallet. Meant for use with pruned wallets and as a companion to importprunedfunds. This will affect wallet balances.
 * @param {string} txid
 * @returns {Promise<>}
 */
RPC.prototype.removePrunedFunds = async function (txid) {
    return this.call('removeprunedfunds', ...(Array.from(arguments)));
}

/**
 * Rescan the local blockchain for wallet related transactions.
 * Note: Use “getwalletinfo” to query the scanning progress.
 * @param {number} start_height
 * @param {number} stop_height
 * @returns {Promise<>}
 */
RPC.prototype.rescanBlockChain = async function (start_height, stop_height) {
    return this.call('rescanblockchain', ...(Array.from(arguments)));
}

/**
 * Send a transaction.
 * @param {Array} outputs
 * @param {number} conf_target
 * @param {string} estimate_mode
 * @param {number} fee_rate
 * @param {Object} options
 * @returns {Promise<>}
 */
RPC.prototype.send = async function (outputs, conf_target, estimate_mode, fee_rate, options) {
    return this.call('send', ...(Array.from(arguments)));
}

/**
 * Send multiple times. Amounts are double-precision floating point numbers.
 * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
 * @param {string} dummy
 * @param {Object} amounts
 * @param {number} minconf
 * @param {string} comment
 * @param {Array} subtractfeefrom
 * @param {boolean} replaceable
 * @param {number} conf_target
 * @param {string} estimate_mode
 * @param {number} fee_rate
 * @returns {Promise<>}
 */
RPC.prototype.sendMany = async function (dummy, amounts, minconf, comment, subtractfeefrom, replaceable, conf_target, estimate_mode, fee_rate) {
    return this.call('sendmany', ...(Array.from(arguments)));
}

/**
 * Send an amount to a given address.
 * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
 * @param {string} address
 * @param {number} amount
 * @param {string} comment
 * @param {string} comment_to
 * @param {boolean} subtractfeefromamount
 * @param {boolean} replaceable
 * @param {number} conf_target
 * @param {string} estimate_mode
 * @param {boolean} avoid_reuse
 * @returns {Promise<>}
 */
RPC.prototype.sendToAddress = async function (address, amount, comment, comment_to, subtractfeefromamount, replaceable, conf_target, estimate_mode, avoid_reuse) {
    return this.call('sendtoaddress', ...(Array.from(arguments)));
}

/**
 * Set or generate a new HD wallet seed. Non-HD wallets will not be upgraded to being a HD wallet. Wallets that are already HD will have a new HD seed set so that new keys added to the keypool will be derived from this new seed.
 * Note that you will need to MAKE A NEW BACKUP of your wallet after setting the HD wallet seed.
 * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
 * @param {boolean} newkeypool
 * @param {boolean} seed
 * @returns {Promise<>}
 */
RPC.prototype.setHdSeed = async function (newkeypool, seed) {
    return this.call('sethdseed', ...(Array.from(arguments)));
}

/**
 * Sets the label associated with the given address.
 * @param {string} address
 * @param {string} label
 * @returns {Promise<>}
 */
RPC.prototype.setLabel = async function (address, label) {
    return this.call('setlabel', ...(Array.from(arguments)));
}

/**
 * Set the transaction fee per kB for this wallet. Overrides the global -paytxfee command line parameter.
 * Can be deactivated by passing 0 as the fee. In that case automatic fee selection will be used by default.
 * @param {number} amount
 * @returns {Promise<>}
 */
RPC.prototype.setTxFee = async function (amount) {
    return this.call('settxfee', ...(Array.from(arguments)));
}

/**
 * Sign a message with the private key of an address Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
 * @param {string} address
 * @param {string} message
 * @returns {Promise<>}
 */
RPC.prototype.signMessage = async function (address, message) {
    return this.call('signmessage', ...(Array.from(arguments)));
}

/**
 * Sign inputs for raw transaction (serialized, hex-encoded).
 * The second optional argument (may be null) is an array of previous transaction outputs that this transaction depends on but may not yet be in the block chain.
 * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
 * @param {string} hexstring
 * @param {Array} prevtxs
 * @param {string} sighashtype
 * @returns {Promise<>}
 */
RPC.prototype.signRawTransactionWithWallet = async function (hexstring, prevtxs, sighashtype) {
    return this.call('signrawtransactionwithwallet', ...(Array.from(arguments)));
}

/**
 * Unloads the wallet referenced by the request endpoint otherwise unloads the wallet specified in the argument.
 * Specifying the wallet name on a wallet endpoint is invalid.
 * @param {string} wallet_name
 * @param {string} load_on_startup
 * @returns {Promise<>}
 */
RPC.prototype.unloadWallet = async function (wallet_name, load_on_startup) {
    return this.call('unloadwallet', ...(Array.from(arguments)));
}

/**
 * Creates and funds a transaction in the Partially Signed Transaction format.
 * Implements the Creator and Updater roles.
 * @param {Array} inputs
 * @param {Array} outputs
 * @param {number} locktime
 * @param {Object} options
 * @param {boolean} bip32derivs
 * @returns {Promise<>}
 */
RPC.prototype.walletCreateFundedPsbt = async function (inputs, outputs, locktime, options, bip32derivs) {
    return this.call('walletcreatefundedpsbt', ...(Array.from(arguments)));
}

/**
 * Removes the wallet encryption key from memory, locking the wallet.
 * After calling this method, you will need to call walletpassphrase again before being able to call any methods which require the wallet to be unlocked.
 * @returns {Promise<>}
 */
RPC.prototype.walletLock = async function () {
    return this.call('walletlock', ...(Array.from(arguments)));
}

/**
 * Stores the wallet decryption key in memory for ‘timeout’ seconds.
 * This is needed prior to performing transactions related to private keys such as sending bitcoins Note:
 * Issuing the walletpassphrase command while the wallet is already unlocked will set a new unlock time that overrides the old one.
 * @param {} passphrase
 * @param {} timeout
 * @returns {Promise<>}
 */
RPC.prototype.walletPassPhrase = async function (passphrase, timeout) {
    return this.call('walletpassphrase', ...(Array.from(arguments)));
}

/**
 * Changes the wallet passphrase from ‘oldpassphrase’ to ‘newpassphrase’.
 * @param {string} oldpassphrase
 * @param {string} newpassphrase
 * @returns {Promise<>}
 */
RPC.prototype.walletPassPhraseChange = async function (oldpassphrase, newpassphrase) {
    return this.call('walletpassphrasechange', ...(Array.from(arguments)));
}

/**
 * Update a PSBT with input information from our wallet and then sign inputs that we can sign for.
 * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
 * @param {string} psbt
 * @param {boolean} sign
 * @param {string} sighashtype
 * @param {boolean} bip32derivs
 * @returns {Promise<>}
 */
RPC.prototype.walletProcessPsbt = async function (psbt, sign, sighashtype, bip32derivs) {
    return this.call('walletprocesspsbt', ...(Array.from(arguments)));
}



/**
 * DigiAsset Core RPCs
 */

/**
 * Returns stats about addresses over time.
 * Warning: The last result is likely not a full time period.
 * @param {number} start_time
 * @param {number} end_time
 * @param {number} time_frame
 * @returns {Promise<>}
 */
RPC.prototype.addressStats = async function (start_time, end_time, time_frame) {
    return this.call('addressstats', ...(Array.from(arguments)));
}

/**
 * Returns mining stats over a given time period.
 * Warning: The last result is likely not a full time period
 * @param {number} start_time
 * @param {number} end_time
 * @param {number} time_frame
 * @returns {Promise<>}
 */
RPC.prototype.algoStats = async function (start_time, end_time, time_frame) {
    return this.call('algostats', ...(Array.from(arguments)));
}

/**
 * Returns address holdings for each assetIndex.
 * @param {string} address
 * @returns {Promise<>}
 */
RPC.prototype.getAddressHoldings = async function (address) {
    return this.call('getaddressholdings', ...(Array.from(arguments)));
}

/**
 * Returns address kyc information.
 * @param {string} address
 * @returns {Promise<{address:string, country:string name?:string, hash?:string }>}
 */
RPC.prototype.getAddressKyc = async function (address) {
    return this.call('getaddresskyc', ...(Array.from(arguments)));
}

/**
 * Returns data about a specific asset.
 * @param {string} asset_index
 * @param {string} exclude_ipfs
 * @returns {Promise<{assetId:string,assetIndex:number,cid:string,count:number,decimals:number,ipfs:{},issuer:{address:string,country:string,hash:string}}>}
 */
RPC.prototype.getAssetData = async function (asset_index, exclude_ipfs) {
    return this.call('getassetdata', ...(Array.from(arguments)));
}

/**
 * Returns an object containing all addresses(keys) holding an asset and how many they have(values).
 * @param {string} asset_index
 * @returns {Promise<{'address':'amount'}>}
 */
RPC.prototype.getAssetHolders = async function (asset_index) {
    return this.call('getassetholders', ...(Array.from(arguments)));
}

/**
 * Returns a list of asset_indexes that belong to a specific asset_id (most will have only 1).
 * @param {string} asset_id
 * @returns {Promise<number[]>}
 */
RPC.prototype.getAssetIndexes = async function (asset_id) {
    return this.call('getassetindexes', ...(Array.from(arguments)));
}

/**
 * Returns current DGB equivalent for an exchange amount.
 * @param {string} address
 * @param {string} index
 * @param {string} amount
 * @returns {Promise<>}
 */
RPC.prototype.getDgbEquivalent = async function (address, index, amount) {
    return this.call('getdgbequivalent', ...(Array.from(arguments)));
}

/**
 * Returns the DigiByte address currently associated with a domain.
 * @param {string} domain
 * @returns {Promise<string>}
 */
RPC.prototype.getDomainAddress = async function (domain) {
    return this.call('getdomainaddress', ...(Array.from(arguments)));
}

/**
 * Return encrypted data associated with an address or list of addresses.
 * @param {string} address
 * @returns {Promise<string>}
 */
RPC.prototype.getEncryptedKey = async function (address) {
    return this.call('getencryptedkey', ...(Array.from(arguments)));
}

/**
 * Returns a list of all current exchange rates
 * @param {number} height (optional)
 * @returns {Promise<{address:string, height:number, index:number, value:number}[]>}
 */
RPC.prototype.getExchangeRates = async function (height) {
    return this.call('getexchangerates', ...(Array.from(arguments)));
}

/**
 * Returns the number of IPFS jobs in queue.
 * @returns {Promise<>}
 */
RPC.prototype.getIpfsCount = async function () {
    return this.call('getipfscount', ...(Array.from(arguments)));
}

/**
 * Returns data about a PSP.
 * @param {number} index
 * @returns {Promise<>}
 */
RPC.prototype.getPsp = async function (index) {
    return this.call('getpsp', ...(Array.from(arguments)));
}

/**
 * Returns a list of txids that an address was involved in.
 * Warning results will be limited based on pruning level.
 * @param {string} address
 * @param {number} min_height
 * @param {number} max_height
 * @param {number} limit
 * @returns {Promise<string[]>}
 */
RPC.prototype.listAddressHistory = async function (address, min_height, max_height, limit) {
    return this.call('listaddresshistory', ...(Array.from(arguments)));
}

/**
 * Returns a list of all asset issuances on basic format.
 * @param {string} asset_id
 * @returns {Promise<{assetId:string, assetIndex:number, cid:string, height:number}[]>}
 */
RPC.prototype.listAssetIssuances = async function (asset_id) {
    return this.call('listassetissuances', ...(Array.from(arguments)));
}

/**
 * Returns a list of asset_id ordered by issuance height.
 * @param {number} number_records
 * @param {number} start_index
 * @param {boolean} basic_output
 * @param {{psp:bool|int}} filter
 * @returns {Promise<>}
 */
RPC.prototype.listAssets = async function (number_records, start_index, basic_output, filter) {
    return this.call('listassets', ...(Array.from(arguments)));
}

/**
 * Returns a list of asset_ids ordered by issuance height.
 * @param {number} number_records
 * @param {number} first_asset
 * @param {boolean} basic_output
 * @param {{psp:bool|int}} filter
 * @returns {Promise<{assetId:string, assetIndex:number, cid:string, height:number}[]>}
 */
RPC.prototype.listLastAssets = async function (number_records, first_asset, basic_output, filter) {
    return this.call('listlastassets', ...(Array.from(arguments)));
}

/**
 * Returns a list of asset_ids ordered by issuance height.
 * @param {number} number_records
 * @param {{psp:bool|int}} filter
 * @returns {Promise<{assetId:string, assetIndex:number, cid:string, height:number}[]>}
 */
RPC.prototype.listLastAssetsPageIndexes = async function (number_records, filter) {
    return this.call('listlastassetspageindexes', ...(Array.from(arguments)));
}

/**
 * Returns a list the last blocks processed.
 * @param {number} limit
 * @param {number} start
 * @returns {Promise<>}
 */
RPC.prototype.listLastBlocks = async function (limit, start) {
    return this.call('listlastblocks', ...(Array.from(arguments)));
}

/**
 * Pins all ipfs meta data.
 * @returns {Promise<>}
 */
RPC.prototype.resyncMetadata = async function () {
    return this.call('resyncmetadata', ...(Array.from(arguments)));
}

/**
 * Turn off digiasset core
 * @returns {Promise<>}
 */
RPC.prototype.shutdown = async function () {
    return this.call('shutdown', ...(Array.from(arguments)));
}

/**
 * Returns the current DigiByte block height and state of digiasset sync.
 * Sync values:
 * 0 = fully synced
 * 1 = stopped
 * 2 = initializing
 * 3 = rewinding
 * 4 = optimizing
 * @returns {Promise<{count:number, sync:number}>}
 */
RPC.prototype.syncState = async function () {
    return this.call('syncstate', ...(Array.from(arguments)));
}

/**
 * Returns the current version number
 * @returns {Promise<string>}
 */
RPC.prototype.version = async function () {
    return this.call('version', ...(Array.from(arguments)));
}

module.exports = RPC;