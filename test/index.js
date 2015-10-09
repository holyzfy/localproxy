var expect = require('expect.js');
var proxyquire = require('proxyquire');
var index = require('../index.js');

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
    it('config', function() {
        var config = index._debug.config;
        expect(config.port).to.be(8089);
    });

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

});