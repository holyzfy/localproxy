var expect = require('expect.js');
var index = require('../index.js');

describe(__filename, function(){
    it('config', function() {
        var config = index._debug.config;
        expect(config.port).to.be(8089);
    });
});