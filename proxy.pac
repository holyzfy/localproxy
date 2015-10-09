var port = {{port}};
var urlMap = {{urlMap}};

function FindProxyForURL(url, host) {
    urlMap.forEach(function(item) {
        var regex = new RegExp('^' + item.from);
        var match = regex.test(url);
        if(match) {
            return 'http://127.0.0.1:' + port;
        }
    });

    return "DIRECT";
}