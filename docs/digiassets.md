# DigiByte Assets

**A simplified way to create digital assets.** DigiAssets is a secure, scalable layer on top of the DigiByte blockchain that allows for the decentralized issuance of digital assets, tokens, smart contracts, digital identity and more.

**Limitless possibilities.** DigiAssets can be used to securely represent anything we find in the physical world. From tangible assets such as real estate or cars, through to scarce digital pieces of art. Signed documents such as deeds and medical bills can be protected.

**Growing confidently.** DigiAssets as an ecosystem and platform already has interested parties either planning on or currently building platforms in real estate, finance, remittance, identity, point of sale, racing, trade, healthcare, supply chain, government and more.

**Solid technology.** DigiAssets leverages unique aspects of a truly decentralized blockchain only found within a permissionless blockchain like DigiByte. This allows DigiAssets to be more secure, scalable and decentralized than any other platform in the market.

Learn more at [DigiByte.org](https://digibyte.org/#digiassets)

## Create asset MetaData

The DigiAsset v3 protocol encourages the use of IPFS to upload the metadata and binaries attached to an asset. Be aware to save the CID and the size of the binaries for future steps. 

Use the `MetaData` class to create the DigiAsset metadata. Then, upload the stringlify version of the object as a raw string to IPFS. Be aware that the metadata needs to calculate the AssetId previously. For locked assets a UTXO in the format `txid:vout` must be hashed to generate the ID and for unlocked asset the `address`.


```javascript
var metadata = new MetaData()
    .name("DuckCoin")
    .description("DuckCoin is a limited-edition token issued on top of the DigiByte blockchain.")
    .addUrl("icon", "ipfs://QmPeYB1noLwNuqaH5oyFgoo5EVNHBhW8F5e581tF66gGNg", "image/png")
    .site("https://digibyte.com/", "web")
    .issuer("DigiByteJS")
    .assetId("a455ad28bf3b1f4b1881f1241c7fd4f144f8612a7e34d78a912a28e25619775b:0", "locked", "aggregatable", 2);

var stringlify = metadata.toString();
```
```
Icon data:
CID:  QmPeYB1noLwNuqaH5oyFgoo5EVNHBhW8F5e581tF66gGNg
Size: 21209 bytes

Upload 'stringlify' to IPFS: 
CID:  bafkreifitsknjetrdz6lcp4fumlrmmiuakkhpa74hru3642jqwr3qlcj3e
Size: 362 bytes
```

## Create asset Rules

The rules are conditions a transaction must follow to transfer the asset. The main use for rules are for setting royalties. If a transaction is detected and the rules are not followed the assets involved will be automatically burned.

```javascript
// 1 DGB royalty to transfer the asset
var rules = new Rules()
    .addRoyalties("dgb1q6ww6wmnqy33he68a5wrm6ej4tuysgtep84p8gl", 100000000, "DGB");
```

## Get the DigiByte Price

The price object will decode a binary string that contains the exchange rate of DigiByte to one unit of multiple crypto and fiat currencies. This price is broadcasted by DigiAssetX and its recommended to always use the last array of prices published.

```javascript
var price = new Price("fiat", "a0e2fe84fb6ffb418072a72af61302428aa0dffaa425024223b4acc733f70442dfc8745702b0f8419a8b1d416f97904146bd4817650ed5419c12b26b1e83bf41cf67375052eadb41cea22eb3a9860242");
```

## Issue asset

To issue a DigiAsset be aware that the output amount is expressed in the minimun divisible units. 

The DigiByte v3 protocol has a distributed storage powered by IPFS and DigiAssetX. The nodes are pre-configured to store all the assets metadata but, to ensure that a node will store your asset MetaData, DigiAssetX has create a payment system where you can pay 1.20 USD per MegaByte of data.

```javascript
var issuer = new AssetIssuer(metadata, rules)
    .addGas({
        txid: "a455ad28bf3b1f4b1881f1241c7fd4f144f8612a7e34d78a912a28e25619775b",
        vout: 0,
        satoshis: 10000000000,
        scriptPubKey: "76a9147199f587502d5b40506d54eb3dca6a318e2f894488ac"
    })
    .addOutput("DFVmLCbkCC9SC7XFA3SUuG3L5fdCbRNAyY", 2100000) // 2100000 units = 21000.00 assets
    .setStorage(21209 + 362, price) // Sum of all data to be storage
    .setGasChange("DFVmLCbkCC9SC7XFA3SUuG3L5fdCbRNAyY")
    .sign("L2aGUHURYodaXaq7cZ8mzmrAipkSk8ESCeqjQzS7oNC2jT7pwFph")
    .build();
```
Broadcast `issuer.raw` hex data.
```
TXID: 70e80c711707debc4502d3b75c8a85f2160a3185a06e47d1e0b7f2e988470afd
```

## Transfer
