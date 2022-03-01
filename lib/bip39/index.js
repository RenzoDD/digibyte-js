'use strict';

var crypto = require('crypto');
var Hash = require('../crypto/hash');
var Random = require('../crypto/random');
var WordList = require('./english.json');

class BIP39 {
	static words = WordList;
	static CreateMnemonic(data = 12) {

		let size = null, entropy = null;

		if (typeof data == 'number')
			size = data;
		else if (typeof data == 'string')
			entropy = Buffer.from(data, 'hex');
		else
			entropy = Buffer.from(data);

		if (!size && entropy)
			size = Buffer.byteLength(entropy) * 8 / 32 * 3;

		if (!size) size = 12;

		if (size <= 0 || size % 3 != 0 || size > 24)
			throw "Mnemonic size not supported!";

		if (!entropy) entropy = Random.getRandomBuffer((32 * size / 3) / 8);

		var checksum = Hash.sha256(entropy);
		var merged = Buffer.concat([entropy, checksum]);

		var words = [];
		var word = 0;
		
		for (var i = 0; i < size * 11 + 1; i++) {
			if (i > 0 && i % 11 == 0) {
				words.push(word);
				word = 0;
			}
				
			var byte = Math.floor(i / 8);
			var position = 7 - (i % 8);

			var data = (merged[byte] >> position) & 1;
			word = word << 1 | data;
		}

		return words.map((x) => {return WordList[x]}).join(" ");
	}
	static CheckMnemonic(phrase) {
		
		if (!phrase) return false;
		if (typeof phrase != "string") return false;

		var words = phrase.split(" ").filter(x => x != "");
		var size = words.length;
		
		if (size <= 0 || size % 3 != 0 || size > 24)
			return false;

		var indexes = words.map(x => { 
			var index = WordList.indexOf(x);
			if (index == -1) return false;
			return index;
		});
		
		var bytes = Buffer.alloc((32 * size / 3) / 8);
		var byte = 0;
		for (var i = 0; i < size * 11; i++) {
			if (i > 0 && i % 8 == 0) {
				bytes[Math.floor(i / 8 - 1)] = byte;
				byte = 0;
			}

			var index = Math.floor(i / 11);
			var position = 10 - (i % 11);

			var data = (indexes[index] >> position) & 1;
			byte = (byte << 1) | data;
		}

		var checksum = Hash.sha256(bytes)[0] >> (8 - (size / 3));
		
		return checksum === byte;
	}
	static MnemonicToSeed(phrase, password) {
		
		if (!password) password = "";
		if (!BIP39.CheckMnemonic(phrase)) throw "Invalid Mnemonic!";

		return crypto.pbkdf2Sync(phrase, "mnemonic" + password, 2048, 512 / 8, 'sha512');
	}
}

module.exports = BIP39;