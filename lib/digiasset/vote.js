function Vote() {
    this.options = [];
    this.movable = true;
    this.cutoff = 0
}

/**
 * Add option to vote
 * @param {string} option 
 * @returns 
 */
Vote.prototype.addVote = function (option) {
    if (typeof option != "string")
        throw "The options must be a string"

    this.options.push(option);

    return this;
}

/**
 * The assets can be sent to other addresses apart from votes
 * @param {boolean} movable 
 * @returns 
 */
Vote.prototype.setMovable = function (movable) {
    this.movable = movable;

    return this;
}

/**
 * When the asset becomes unmovable (height or ms)
 * height < 1577836800000 <= ms since Jan. 1 1970
 * @param {integer} cutoff 
 * @returns 
 */
Vote.prototype.setCutoff = function (cutoff) {
    if (typeof value != 'number' && typeof value != 'bigint')
        value = (new Date(value)).getTime()

    this.cutoff = cutoff;

    return this;
}

Vote.addresses = ["D8LWk1fGksGDxZai17A5wQUVsRiV69Nk7J", "DBJNvWeirccgeAdZn9gV5otheutdthzWxx", "D9zaWjGHuVNB32G7Pf5BMmtvDifdoS3Wsq", "DEKQEMFHTc1M8Gs4xvY6paZ5RKtE1cbqNp", "D8jnQigMYwhrB6Zjs73deF5RKprUdX5uvd", "DELKWiuSj86pMfDb7aDaAUhLYG8D7H6JVj", "DHUg85Pbc6mDK3y7kaWmsqjRaWfRVGys2U", "D9rxXUhaDxku4ZhdkLtyZzmmGG5ViUAYds", "DNehqnpzLWnv7vTTxkbHsneajBEzGjvLo2", "DAKiRnvVCfD4imp5A41tCeoZkezzkPXB4C", "D69jwFMuawBkG1hii1muQESFrbZFenZrmL", "D7PJqwFSLmCURDNnd5cc9Ham856GwDQ9zy", "DFHa9HQ9BDHuDKmBPvPzBE5dsLm85prUd4", "DAJMr7m4ZyaCRa9Y1o8pMaAPViBhSZTENs", "DFXqwRzai3Khd3n1uRaYgZTq1BhAUhyu3m", "DSTKiCYQqpvrXME3rEFeYEsH3dZHCPU8ez", "DG1rJMg6zCMoiptWeEozxpuVWKGmZkiHTf", "DRgWqHV6d7HSxYhA5bCMvtLhuS3kbRYKo3", "DD9kssWTzT8s5fv4Xg3MthRNCT7RtawQSw", "DLLYN7hv535nXzpvZv25ySG8GdsfYNk1Bx", "DJQEaiT39GyJgCJK7noarscutoeWHXMLaM", "DEkaR4NfvWx3bq1MBw2nTcTP2JEPxKyaBX", "DN9vVGNYzbjqTGRRGXkjiGVTpuKRz1eYe3", "D6kCF8PDhwdPzSg3xeUmrDzVK9eK3nuEJj", "DR3F3WE78aJmHvyGA35NjkLLf5F9X8eKaz", "DSMdwgWYbEpPNQJ2Hs9Y89JqNmQdiwhWaq", "DGJCxLgqW2sbhomNZvsDGsjam8pnY2b7uA", "DAaQuGSbvRQA2B7zzbrQ3SRRYC9qaQVZch", "DJbcjvGf7wzQaAQQ9GpHP1menk6jHyCsW4", "DC5vxafEZQeqpqDawTyDx7nBW81V6LfrE5", "DKJhzwe5PzFQuUdrzJR9gUfkvk4jzvUrZU", "DRX7r83LHBf1cWKnBoAd8q1iN6UP833kPx", "DShw4ZaRmW9fyWnP3umEyZ9KyJHWR9v6BD", "DK9zdFCv9yz3C7jVbnTbVCZgGAd8S1Xqxk", "DG2Gv2aZRALtMkKtaJEQr75bFqsL3JbKmB", "D9zt7Xb1RgBepPrrYSRPv6N6YCUcS5CRx6", "DAgRoBgYaDx7g6JPRZyufvFQAQc4zdjaP1", "DPLi14JkyEjkbWQMQGavBARN8xo4avmuMh", "DU4mqG99gi77BcZoS8FaJEiHk5HRYXNEcb", "D6QdquB54saxViwAfL9xKiwoXaFo7UU5ec", "DStTMUY2U1XSLsdq9uuWgfQefPDkQJkGQC", "DPUV7Htc7jBwhc9z5rqoDFmKW3y1fE8xwA", "DEGatQLqYCD9BumaXAqTFRCYZ4vznhQXcY", "DCL7fkgzSSQSLvDMXqiRdnR9qQx5MjK89t", "DNxc93Q2rrCm92sVyrtKhCn5MMC5YtuXxK", "DDtWWXHe9a4EPn2EawiTDzYjq8SEKKRS6J", "DNr54LSpN6iAQda1QYqykqeU7j7TyLeCcA", "DE6eJePsjMDrTdKoi8HAGbX6Sdwh4RGTP9", "D5kY1eMcDfLZWznQFSjCQMUW8DiSoxhmuy", "D6dSnsPqcLaVvcH1MSFRMUy5KyVbnDufiX"];


module.exports = Vote;