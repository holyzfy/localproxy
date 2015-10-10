var port = {{port}};
var urlMap = {{urlMap}};

function FindProxyForURL(url, host) {
    var match = urlMap.some(function(item) {
        return url.slice(0, item.from.length) === item.from;
    });
    
    if(match) {
        return 'PROXY 127.0.0.1:' + port + '; DIRECT';
    }

    return 'DIRECT';
}