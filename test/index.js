var expect = require('expect.js');
var index = require('../index.js');

describe(__filename, function(){
    it('config', function() {
        var config = index._debug.config;
        expect(config.port).to.equal(8089);
        expect(config.map).to.have.length(2);
    });
});