var config = require('config');
var express = require('express');
var read = require('read-file');
var url = require('url');

var getPAC = function() {
    var template = read.sync('proxy.pac', {encoding: 'utf8'});
    var map = config.map || [];
    var ret = template.replace('{{port}}', config.port)
                    .replace('{{urlMap}}', JSON.stringify(map, null, 4));
    return ret;
};

var getStaticList = function(config) {
    var ret = [];
    config.map.forEach(function(item) {
        ret.push({
            path: url.parse(item.from).pathname,
            to: item.to
        });
    });
    return ret;
};

var startServer = function() {
    var app = express();
    var staticList = getStaticList(config);
    staticList.forEach(function(item) {
        app.use(item.path, express.static(item.to));
    });

    app.get('/proxy.pac', function(req, res) {
        res.set({
            'Content-Type': 'application/x-ns-proxy-autoconfig'
        });
        res.send(getPAC());
    });

    app.listen(config.port, function() {
        console.log('Server running at', config.port);
    });
};

startServer();

module.exports = {
    _debug: {
        config: config,
        getPAC: getPAC,
        getStaticList: getStaticList
    }
};
