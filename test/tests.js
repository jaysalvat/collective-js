/* global describe, it */

'use strict';

var expect = chai.expect;

if (typeof window === 'undefined') {
    var collective-js = require('../dist/collective-js.js');
    var chai = require('chai');
}

describe("collective-js tests", () => {
    it("should work", () => {
        expect(collective-js).to.be.a('function');
        expect(collective-js).to.not.throw(Error);
    });
});
