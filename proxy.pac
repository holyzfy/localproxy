var port = {{port}};
var urlMap = {{urlMap}};

function FindProxyForURL(url, host) {
    var match = urlMap.filter(function(item) {
        return url.slice(0, item.from.length) === item.from;
    });
    
    if(match.length > 0) {
        return 'PROXY 127.0.0.1:' + port + '; DIRECT';
    }

    return 'DIRECT';
}