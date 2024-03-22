const https = require('https');
const http = require('http');
const URL = require('url');

function get(route, headers) {
    return new Promise(function (resolve, reject) {
        var url = URL.parse(route);

        (url.protocol === "https:" ? https : http).get({
            hostname: url.hostname,
            port: url.port,
            path: url.path,
            method: 'GET',
            headers
        }, function (result) {
            let data = "";
            result.on("data", function (buffer) { data += buffer; });
            result.on("end", function () {
                try {
                    var json = JSON.parse(data);
                    resolve(json);
                }
                catch (err) { resolve({ error: err }); }
            });
            result.on('error', function (err) { resolve({ error: err }); });
        });
    });
}

function post(route, data, headers = {}, auth) {
    if (typeof data == 'object')
        data = JSON.stringify(data);

    const dataString = data;

    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = dataString.length;

    const options = {
        method: 'POST',
        headers,
        auth
    }

    return new Promise(function (resolve, reject) {
        const req = (route.startsWith("https") ? https : http).request(route, options, function (res) {
            const body = []
            res.on('data', function (chunk) { body.push(chunk) })
            res.on('end', function () {
                try {
                    var response = Buffer.concat(body).toString();
                    var json = JSON.parse(response);
                    resolve(json);
                }
                catch (err) {
                    resolve({ error: err.message });
                }
            })
        });
        req.on('error', function (err) { resolve({ error: err.message }); });
        req.on('timeout', function (err) { resolve({ error: 'Timed out' }); })
        req.write(dataString);
        req.end();
    })
}

module.exports = { get, post };