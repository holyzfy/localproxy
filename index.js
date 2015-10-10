var config = require('config');
var express = require('express');
var read = require('read-file');
var url = require('url');
var exec = require('child_process').exec;
var os = require('os');
var async = require('async');
var debug = require('debug')('localproxy:index.js');

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

var runCmd = function(cmd, options, callback) {
    callback = arguments[arguments.length - 1];

    var eventEmitter = exec(cmd, options, function(err, stdout, stderr) {
        callback(err || stderr, stdout);
    });

    // eventEmitter.stdout.on('data', debug);
    // eventEmitter.stderr.on('data', debug);

    return eventEmitter;
};

var getAllNetworkServices = function(callback) {
    var cmd = 'networksetup -listallnetworkservices | tail +2';
    runCmd(cmd, function(err, stdout) {
        if(err) {
            return callback(err);
        }

        var list = stdout.trim().split(/\r?\n/);
        callback(null, list);
    });
};

var setPAC;

if(/Darwin/i.test(os.type())) {
    setPAC = function(url, callback) {
        getAllNetworkServices(function(err, list) {
            if(err) {
                return callback(err);
            }

            debug('network services=', list);
            
            var tasks = [];

            var run = function(item, cb) {
                var cmd = 'sudo networksetup -setautoproxyurl "{{service}}" "{{url}}"'
                            .replace('{{service}}', item)
                            .replace('{{url}}', url);
                debug('setPAC:', cmd);
                runCmd(cmd, cb);
            };

            list.forEach(function(item) {
                tasks.push(run.bind(null, item));
            });

            async.series(tasks, callback);
        });
    };
} else if(/windows/i.test(os.type())) {
    setPAC = function(url, callback) {
        var cmd = 'REG ADD "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /d "{{url}}" /f'
                    .replace('{{url}}', url);
        debug('setPAC:', cmd);
        runCmd(cmd, callback);
    };
}

var startServer = function(callback) {
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

    app.listen(config.port, callback);
};

startServer(function() {
    console.log('Server running at', config.port);
});

module.exports = {
    _debug: {
        config: config,
        getPAC: getPAC,
        getStaticList: getStaticList,
        runCmd: runCmd,
        getAllNetworkServices: getAllNetworkServices,
        setPAC: setPAC
    }
};
