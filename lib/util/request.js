const https = require('https');
const http = require('http');
const URL = require('url');

function get(route, headers) {
    return new Promise(async (resolve, reject) => {
        var url = URL.parse(route);

        (url.protocol === "https:" ? https : http).get({
            hostname: url.hostname,
            port: url.port,
            path: url.path,
            method: 'GET',
            headers
        }, function (result) {
            let data = "";
            result.on("data", (buffer) => { data += buffer; });
            result.on("end", function () {
                try {
                    var json = JSON.parse(data);
                    resolve(json);
                }
                catch { resolve(null); }
            });
            result.on('error', () => { resolve(null) })
        });
    });
}

function post(route, data, headers = {}) {
    if (typeof data == 'object')
        data = JSON.stringify(data);

    const dataString = data;

    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = dataString.length;

    const options = {
        method: 'POST',
        headers
    }

    return new Promise((resolve, reject) => {
        const req = (route.startsWith("https") ? https : http).request(route, options, (res) => {
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

module.exports = { get, post };