# DigiByte URIs

Represents a DigiByte payment URI. DigiByte URI strings became the most popular way to share payment request, sometimes as a DigiByte link and others using a QR code.

URI Examples:

```sh
digibyte:DCxo6SCKMdyoUpyYydqG3prC3e4NNCy5nG
digibyte:DCxo6SCKMdyoUpyYydqG3prC3e4NNCy5nG?amount=1.2
digibyte:DCxo6SCKMdyoUpyYydqG3prC3e4NNCy5nG?amount=1.2&message=Payment&label=Satoshi&extra=other-param
```

## URI Validation

The main use that we expect you'll have for the `URI` class in DigiByteJS is validating and parsing DigiByte URIs. A `URI` instance exposes the address as a DigiByteJS `Address` object and the amount in Satoshis, if present.

The code for validating URIs looks like this:

```javascript
var uriString = 'digibyte:DCxo6SCKMdyoUpyYydqG3prC3e4NNCy5nG?amount=1.2';
var valid = URI.isValid(uriString);
var uri = new URI(uriString);
console.log(uri.address.network, uri.amount); // 'livenet', 120000000
```

## URI Parameters

All standard parameters can be found as members of the `URI` instance. However a DigiByte URI may contain other non-standard parameters, all those can be found under the `extra` namespace.

See [the official BIP21 spec](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) for more information.

## Create URI

Another important use case for the `URI` class is creating a bitcoin URI for sharing a payment request. That can be accomplished by using a dictionary to create an instance of URI.

The code for creating an URI from an Object looks like this:

```javascript
var uri = new URI({
	address: 'DCxo6SCKMdyoUpyYydqG3prC3e4NNCy5nG',
	amount : 10000, // in satoshis
	message: 'My payment request'
  });
var uriString = uri.toString();
```
