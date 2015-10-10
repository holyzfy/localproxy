var expect = require('expect.js');
var proxyquire = require('proxyquire');
var os = require('os');

var myConfig = {
    port: 8089,
    map: [
        {
            from: 'http://dev.f2e.test.com/a_project/',
            to: '/path/to/a_project/'
        },
        {
            from: 'http://dev.f2e.test.com/b_project/css/index.css',
            to: '/path/to/b_project/css/test.css'
        }
    ]
};
var proxyIndex = proxyquire('../index.js', {
    config: myConfig
});

describe(__filename, function(){

    it('getPAC', function() {
        expect(proxyIndex._debug.config.map).to.have.length(2);

        var pac = proxyIndex._debug.getPAC();
        expect(pac).to.contain('var port = 8089;');
        expect(pac).to.contain('http://dev.f2e.test.com/b_project/css/index.css');
        expect(pac).to.contain('function FindProxyForURL(');
    });

    it('getStaticList', function() {
        var ret = proxyIndex._debug.getStaticList(myConfig);
        var expected = [
            {
                path: '/a_project/',
                to: '/path/to/a_project/'
            },
            {
                path: '/b_project/css/index.css',
                to: '/path/to/b_project/css/test.css'
            }
        ];
        expect(ret).to.eql(expected);
    });

    it('match', function() {
        var url = 'http://dev.f2e.test.com/a_project/css/index.css'
        var urlMap = myConfig.map;
        var match = urlMap.some(function(item) {
            return url.slice(0, item.from.length) === item.from;
        });
        expect(match).to.be.ok();
    });

    it('run 1', function() {
        var badCmd = 'a_bad_cmd';
        expect(proxyIndex._debug.runCmd).withArgs(badCmd, function() {}).to.not.throwException();
    });

    it('run 2', function(done) {
        var badCmd = 'a_bad_cmd';
        proxyIndex._debug.runCmd(badCmd, function(err, stdout) {
            expect(err).to.be.a(Error);
            done();
        });
    });

    it('run 3', function(done) {
        var echo = 'echo "hello"';
        proxyIndex._debug.runCmd(echo, function(err, stdout) {
            expect(err).to.be(null);
            expect(stdout).to.be.contain('hello');
            done();
        });
    });

    if(/Darwin/i.test(os.type())) {
        it('getAllNetworkServices', function(done) {
            proxyIndex._debug.getAllNetworkServices(function(err, ret) {
                expect(err).to.be(null);
                expect(ret.length).to.be.above(0);
                done();
            });
        });
    }
    
    it('setPAC', function(done) {
        proxyIndex._debug.setPAC('http://127.0.0.1:8089/proxy.pac', done);
    });

    it('unSetPAC', function(done) {
        proxyIndex._debug.unSetPAC(done);
    });


});