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
    return config.map.map(function(item) {
        return {
            path: url.parse(item.from).pathname,
            to: item.to
        };
    });
};

var runCmd = function(cmd, options, callback) {
    callback = arguments[arguments.length - 1];

    return exec(cmd, options, function(err, stdout, stderr) {
        callback(err || stderr, stdout);
    });
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
var unSetPAC;

if('Darwin' === os.type()) {
    setPAC = function(url, callback) {
        getAllNetworkServices(function(err, list) {
            if(err) {
                return callback(err);
            }

            debug('network services=', list);
            
            var run = function(item, cb) {
                var cmd = 'sudo networksetup -setautoproxyurl "{{service}}" "{{url}}"'
                            .replace('{{service}}', item)
                            .replace('{{url}}', url);
                debug('setPAC:', cmd);
                runCmd(cmd, cb);
            };

            var tasks = list.map(function(item) {
                return run.bind(null, item);
            });

            async.series(tasks, callback);
        });
    };

    unSetPAC = function(callback) {
        getAllNetworkServices(function(err, list) {
            if(err) {
                return callback(err);
            }
            
            var run = function(item, cb) {
                var cmd = 'sudo networksetup -setautoproxystate "{{service}}" off'
                            .replace('{{service}}', item);
                debug('unsetPAC:', cmd);
                runCmd(cmd, cb);
            };

            var tasks = list.map(function(item) {
                return run.bind(null, item);
            });

            async.series(tasks, callback);
        });
    };
} else if('Windows_NT' === os.type()) {
    setPAC = function(url, callback) {
        var cmd = 'REG ADD "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /d "{{url}}" /f'
                    .replace('{{url}}', url);
        debug('setPAC:', cmd);
        runCmd(cmd, callback);
    };

    unSetPAC = function(callback) {
        var cmd = 'REG ADD "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v AutoConfigURL /d "" /f';
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

var exitHandler = function() {
    var busy = false;

    var callback = function(options) {
        process.stdin.resume();
        options = options || {};
        if(busy) {
            return;
        }
        busy = true;
        console.log('unset PAC');
        unSetPAC(process.exit);
    };

    process.on('exit', callback);
    process.on('SIGINT', callback);
    process.on('uncaughtException', callback);
};

startServer(function() {
    var url = 'http://127.0.0.1:{{port}}/proxy.pac'.replace('{{port}}', config.port);
    setPAC && setPAC(url, function() {
        console.log('set PAC:', url);
        console.log('Server running at', config.port);
        exitHandler();
    });
});

module.exports = {
    _debug: {
        config: config,
        getPAC: getPAC,
        getStaticList: getStaticList,
        runCmd: runCmd,
        getAllNetworkServices: getAllNetworkServices,
        setPAC: setPAC,
        unSetPAC: unSetPAC
    }
};
