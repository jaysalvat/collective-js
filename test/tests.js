/* global Collective, describe, it, beforeEach */
/* jshint expr: true */

'use strict';

var _;

if (typeof window === 'undefined') {
    _ = require('../dist/collective.js');
    var chai = require('chai');
} else {
    _ = Collective;
}

var expect = chai.expect;

var collection = [
    { id: 1, name: 'Brad' },
    { id: 2, name: 'George' },
    { id: 3, name: 'Matt' },
    { id: 4, name: 'Andy' },
    { id: 5, name: 'Julia' },
];

var complexCollection = [
    { id: 1, info: { data: [ { state: true } ],  gender: 'male',   name: 'Brad' } },
    { id: 2, info: { data: [ { state: true } ],  gender: 'male',   name: 'George' } },
    { id: 3, info: { data: [ { state: false } ], gender: 'male',   name: 'Matt' } },
    { id: 4, info: { data: [ { state: true } ],  gender: 'male',   name: 'Andy'  } },
    { id: 5, info: { data: [ { state: false } ], gender: 'female', name: 'Julia' } }
];

var _collection, _complexCollection;

describe("Collective tests", function () {
    beforeEach(function () {
        _collection = _(collection);
        _complexCollection = _(complexCollection);
    });

    describe("Constructor()", function () {
        it("should be a Collective collection", function () {
            expect(_collection).to.be.an.instanceof(_);
        });

        it("should have 5 elements", function () {
            expect(_collection.length).to.be.equal(5);
        });

        it("should have 5 elements", function () {
            var _elements = _(_collection);
            expect(_elements.length).to.be.equal(5);
        });

        it("should throw an error", function () {
            expect(function () { _('string'); }).to.throw(Error);
        });

        it("should throw an error", function () {
            expect(function () { _(1); }).to.throw(Error);
        });

        it("should throw an error", function () {
            expect(function () { _( [ { name: 'Bernie' }, 1 ]); }).to.throw(Error);
        });

        it("should throw an error", function () {
            expect(function () { _( [ { name: 'Bernie' }, 'string' ]); }).to.throw(Error);
        });

        it("should throw an error", function () {
            expect(function () { _( [ { name: 'Bernie' }, [] ]); }).to.throw(Error);
        });

        it("should not throw an error", function () {
            expect(function () { _({ name: 'Bernie' }); }).to.not.throw(Error);
        });

        it("should not throw an error", function () {
            expect(function () { _({}); }).to.not.throw(Error);
        });

        it("should not throw an error", function () {
            expect(function () { _([]); }).to.not.throw(Error);
        });

        it("should not throw an error", function () {
            var fn = function () {
                return [ { name: 'Bernie' } ];
            };
            expect(function () { _(fn); }).to.not.throw(Error);
        });
    });

    describe('path()', function () {
        describe('path() with simple object', function () {
            var json = { info: { gender: 'male', name: 'Brad' }};

            it('should return Brad', function () {
                var name = _.path(json, 'info.name');
                expect(name).to.be.equal('Brad');
            });

            it('should return undefined', function () {
                var name = _.path(json, 'info.does.not.exist');
                expect(name).to.be.undefined;
            });
        });

        describe('path() with array', function () {
            var json = { people: [
                { gender: 'male', name: 'Matt' },
                { gender: 'female', name: 'Julia' }
            ]};

            it('should return Matt', function () {
                var name = _.path(json, 'people[0].name');
                expect(name).to.be.equal('Matt');
            });

            it('should return Julia', function () {
                var name = _.path(json, 'people[1].name');
                expect(name).to.be.equal('Julia');
            });

            it('should return undefined', function () {
                var name = _.path(json, 'people[2].name');
                expect(name).to.be.undefined;
            });
        });
    });

    describe("first()", function () {
        it("should return Brad", function () {
            var element = _collection.first();
            expect(element.name).to.be.equal('Brad');
        });
    });

    describe("last()", function () {
        it("should return Julia", function () {
            var element = _collection.last();
            expect(element.name).to.be.equal('Julia');
        });
    });

    describe("get()", function () {
        it("should return Brad with index 0", function () {
            var element = _collection.get(0);
            expect(element.name).to.be.equal('Brad');
        });

        it("should return Julia with index 4", function () {
            var element = _collection.get(4);
            expect(element.name).to.be.equal('Julia');
        });
    });

    describe("set()", function () {
        it("should replace element index 3 by Elliot", function () {
            var _elements = _collection.set(3, { id: 10, name: 'Elliot'});
            expect(_elements.get(3).name).to.be.equal('Elliot');
        });

        it("should return Julia with index 4", function () {
            var element = _collection.get(4);
            expect(element.name).to.be.equal('Julia');
        });
    });

    describe("sort()", function () {
        it("should sort by name asc with param { name: 1 }", function () {
            var _sortedAsc = _complexCollection.sort({ 'info.name': 1 });

            expect(_sortedAsc.all()).to.be.deep.equal([
                { id: 4, info: { data: [ { state: true } ],  gender: 'male',   name: 'Andy'  } },
                { id: 1, info: { data: [ { state: true } ],  gender: 'male',   name: 'Brad' } },
                { id: 2, info: { data: [ { state: true } ],  gender: 'male',   name: 'George' } },
                { id: 5, info: { data: [ { state: false } ], gender: 'female', name: 'Julia' } },
                { id: 3, info: { data: [ { state: false } ], gender: 'male',   name: 'Matt' } }
            ]);
        });

        it("should sort by name asc with param { name: 1 }", function () {
            var _sortedAsc = _collection.sort({ name: 1 });

            expect(_sortedAsc.all()).to.be.deep.equal([
                { id: 4, name: 'Andy' },
                { id: 1, name: 'Brad' },
                { id: 2, name: 'George' },
                { id: 5, name: 'Julia' },
                { id: 3, name: 'Matt' },
            ]);
        });

        it("should sort by name desc with param { name: -1 }", function () {
            var _sorted = _collection.sort({ name: -1 });

            expect(_sorted.all()).to.be.deep.equal([
                { id: 3, name: 'Matt' },
                { id: 5, name: 'Julia' },
                { id: 2, name: 'George' },
                { id: 1, name: 'Brad' },
                { id: 4, name: 'Andy' },
            ]);
        });

        it("should sort by name asc { name: 1, id: 1 }", function () {
            var _sorted = _([
                { id: 1, name: 'Brad' },
                { id: 2, name: 'Don' },
                { id: 3, name: 'George' },
                { id: 4, name: 'Brad' },
                { id: 5, name: 'Don' },
            ]).sort({ name: 1, id: 1 });

            expect(_sorted.all()).to.be.deep.equal([
                { id: 1, name: 'Brad' },
                { id: 4, name: 'Brad' },
                { id: 2, name: 'Don' },
                { id: 5, name: 'Don' },
                { id: 3, name: 'George' },
            ]);
        });

        it("should sort by name asc with param { name: 1, id: 1 }", function () {
            var _sorted = _([
                { id: 1, name: 'Brad' },
                { id: 2, name: 'Don' },
                { id: 3, name: 'George' },
                { id: 4, name: 'Brad' },
                { id: 5, name: 'Don' },
            ]).sort({ name: 1, id: -1 });

            expect(_sorted.all()).to.be.deep.equal([
                { id: 4, name: 'Brad' },
                { id: 1, name: 'Brad' },
                { id: 5, name: 'Don' },
                { id: 2, name: 'Don' },
                { id: 3, name: 'George' },
            ]);

            _collection = _collection.sort({ id: 1 });
        });
    });

    describe("where()", function () {
        it("should return Matt with param { id: 3 }", function () {
            var _elements = _collection.where({ id: 3 });
            expect(_elements.prop('name')).to.be.equal('Matt');
        });

        it("should return Matt with param { id: 3, name: 'Matt' }", function () {
            var _elements = _collection.where({ id: 3, name: 'Matt' });
            expect(_elements.prop('name')).to.be.equal('Matt');
        });

        it("should return undefined with param { id: 3, name: 'Bruce' }", function () {
            var _elements = _collection.where({ id: 3, name: 'Bruce' });
            expect(_elements.prop('id')).to.be.undefined;
        });

        it("should return 3 elements with param [{ id: 1 }, { id: 2 }, { id: 3 }]", function () {
            var _elements = _collection.where([{ id:1 }, { id: 2 }, { id: 3 }]);
            expect(_elements.length).to.be.equal(3);
        });

        it('should return 2 elements with param { name: "Don" }', function () {
            var _collection = _([
                { id: 1, name: 'Don' },
                { id: 2, name: 'Brad' },
                { id: 3, name: 'Don' },
            ]);
            var _elements = _collection.where({ name: 'Don' });
            expect(_elements.length).to.be.equal(2);
        });

        it("should return indexes with param { indexes: true }", function () {
            var indexes = _collection.where([{ id:1 }, { id: 3 }, { id: 5 }], { indexes: true });
            expect(indexes).to.be.deep.equal([ 0, 2, 4 ]);
        });

        it("should return George with param 1", function () {
            var _elements = _collection.where(1);
            expect(_elements.prop('name')).to.be.equal('George');
        });

        it("should return 2 elements with param [{ id: 1 }, 1]", function () {
            var _elements = _collection.where([{ id:1 }, 1]);
            expect(_elements.get(0).name).to.be.equal('Brad');
            expect(_elements.get(1).name).to.be.equal('George');
        });

        it('should return only 2 elements with param [{ id: 1 }, { id: 2 }, { id: 1 }]', function () {
            var _elements = _collection.where([{ id: 1 }, { id: 2 }, { id: 1 }]);
            expect(_elements.length).to.be.equal(2);
        });
    });

    describe('where() with function', function () {
        it('should return Brad and Julia', function () {
            var elements = _collection.where({
                name: function (value) {
                    return value[0] === 'B' || value[0] === 'J';
                }
            }).all();

            expect(elements.length).to.be.equal(2);
            expect(elements[0].name).to.be.equal('Brad');
            expect(elements[1].name).to.be.equal('Julia');
        });

        it('should return Brad and Julia with path param', function () {
            var elements = _complexCollection.where({
                'info.name': function (value) {
                    return value[0] === 'B' || value[0] === 'J';
                }
            }).all();

            expect(elements.length).to.be.equal(2);
            expect(elements[0].info.name).to.be.equal('Brad');
            expect(elements[1].info.name).to.be.equal('Julia');
        });
    });

    describe('where() with path', function () {
        it('should return 3 elements', function () {
            var _elements = _complexCollection.where({ 'info.data[0].state': true });
            expect(_elements.length).to.be.equal(3);
        });

        it('should return 4 elements', function () {
            _collection = _(complexCollection);

            var _elements = _collection.where({ 'info.gender': 'male' });
            expect(_elements.length).to.be.equal(4);
        });

        it('should return 1 element', function () {
            _collection = _(complexCollection);

            var _elements = _collection.where({ 'info.gender': 'female' });
            expect(_elements.length).to.be.equal(1);
        });
    });

    describe("find()", function () {
        it("should return 1 element Brad with param { name: 'Brad' }", function () {
            var element = _collection.find({ name: 'Brad' });
            expect(element.name).to.be.equal('Brad');
        });

        it("should return 1 element Brad with param { name: 'Brad' }, { name: 'George' }", function () {
            var element = _collection.find([{ name: 'Brad' }, { name: 'George' }]);
            expect(element.name).to.be.equal('Brad');
        });

        it("should return an empty element with param { name: 'Bruce' }", function () {
            var element = _collection.find({ name: 'Bruce' });
            expect(element.name).to.be.undefined;
        });
    });

    describe("uniq()", function () {
        it("it shoud return only one element of each", function () {
            var uniq = _([
                { id: 1, name: 'Brad' },
                { id: 1, name: 'Brad' },
                { id: 2, name: 'George' },
                { id: 3, name: 'Matt' },
                { id: 3, name: 'Matt' },
                { id: 4, name: 'Andy' },
                { id: 5, name: 'Julia' },
                { id: 5, name: 'Julia' },
            ]).uniq();

            expect(uniq.all()).to.be.deep.equal([
                { id: 1, name: 'Brad' },
                { id: 2, name: 'George' },
                { id: 3, name: 'Matt' },
                { id: 4, name: 'Andy' },
                { id: 5, name: 'Julia' },
            ]);
        });
    });

    describe("before()", function () {
        it("should add an element before element George", function () {
            var newItem = { 'id': 10, 'name': 'Scott' };
            var query = { name: 'George' };
            var index = _collection.index(query);
            var _elements = _collection.before(query, newItem);
            var index1 = _elements.index(newItem);
            var index2 = _elements.index(query);

            expect(_elements.length).to.be.equal(6);
            expect(index).to.be.equal(index1);
            expect(index2).to.be.equal(index + 1);
        });
    });

    describe("after()", function () {
        it("should add an element after element George", function () {
            var newItem = { 'id': 10, 'name': 'Scott' };
            var query = { name: 'George' };
            var index = _collection.index(query);
            var _elements = _collection.after(query, newItem);
            var index1 = _elements.index(newItem);
            var index2 = _elements.index(query);

            expect(_elements.length).to.be.equal(6);
            expect(index + 1).to.be.equal(index1);
            expect(index2).to.be.equal(index);
        });
    });

    describe("prepend()", function () {
        it("should add an element at the beginning of the Collection", function () {
            _collection = _collection.prepend({
                id: 6,
                name: 'Don'
            });
            expect(_collection.length).to.be.equal(6);
            expect(_collection.first().name).to.be.equal('Don');
        });
    });

    describe("append()", function () {
        it("should add an element at the end of the Collection", function () {
            _collection = _collection.append({ id: 7, name: 'Don' });

            expect(_collection.length).to.be.equal(6);
            expect(_collection.last().name).to.be.equal('Don');
        });
    });

    describe("replace()", function () {
        it("should replace Brad element by Casey", function () {
            var replacement = { id: 10, name: 'Casey' };

            var _elements = _collection.replace({ name: 'Brad' }, replacement);

            var element1 = _elements.find({ name: 'Brad' });
            expect(element1).to.be.deep.equal({});

            var element2 = _elements.find({ name: 'Casey' });
            expect(element2).to.be.deep.equal(replacement);
        });
    });

    describe("update()", function () {
        it("should modify all the elements with param { name: 'Casey' }", function () {
            var element = _collection.find({ name: 'Casey' });
            expect(element.id).to.be.not.equal(4);
        });

        it("should modify the element 4 with param { id: 4 }", function () {
            var _elements = _collection.update({ id: 4 }, { name: 'Casey' });

            var element = _elements.find({ name: 'Casey' });
            expect(element.id).to.be.equal(4);
        });

        it("should modify the element at index 1 with params 1, { name: 'Casey' }", function () {
            var _elements = _collection.update(1, { name: 'Casey' });

            var element = _elements.find(1);
            expect(element.name).to.be.equal('Casey');
        });

        it("should modify two elements with params 1, { id: 1 }, { name: 'Casey' }", function () {
            var _elements = _collection.update([1, { id: 2 }], { name: 'Casey' });

            var element1 = _elements.find(1);
            expect(element1.name).to.be.equal('Casey');

            var element2 = _elements.find({ id: 2 });
            expect(element2.name).to.be.equal('Casey');
        });
    });

    describe("pluck()", function () {
        it("should return an array of names with param 'name'", function () {
            var names = _collection.where([{ id: 1 }, { id: 2 }]).pluck('name');

            expect(names).to.be.deep.equal([ 'Brad', 'George' ]);
        });

        it("should return an array of names with param 'info.name'", function () {
            var names = _complexCollection.where([{ id: 1 }, { id: 2 }]).pluck('info.name');

            expect(names).to.be.deep.equal([ 'Brad', 'George' ]);
        });

        it("should return an object with id and names with param 'id', 'name'", function () {
            var object = _collection.where([{ id: 1 }, { id: 2 }]).pluck('id', 'name');

            expect(object).to.be.deep.equal({ 1: 'Brad', 2: 'George' });
        });

        it("should return an object with id and names with param 'id.name', 'name (id)'", function () {
            var object = _collection.where([{ id: 1 }, { id: 2 }]).pluck(
                [ 'id', 'name' ],
                [ 'id', 'name', 'toto' ],
                '{0}.{1}',
                '{1} ({0})'
            );

            expect(object).to.be.deep.equal({ '1.Brad': 'Brad (1)', '2.George': 'George (2)' });
        });
    });

    describe("transfer()", function () {
        it("should return a collection with mapped fields", function () {
            var _elements = _complexCollection.transfer({
                'id': 'id',
                'gender': 'info.gender',
                'name': 'info.name',
            });

            expect(_elements.all()).to.be.deep.equal([
                { id: 1, name: 'Brad',   gender: 'male' },
                { id: 2, name: 'George', gender: 'male' },
                { id: 3, name: 'Matt',   gender: 'male' },
                { id: 4, name: 'Andy',   gender: 'male' },
                { id: 5, name: 'Julia',  gender: 'female' }
            ]);
        });

        it("should return a collection with mapped fields with object", function () {
            var _elements = _complexCollection.transfer({
                'id': 'id',
                'gender': { info: { deep: 'info.gender' }},
                'name':   { info: { deep: 'info.name' }}
            });

            expect(_elements.all()).to.be.deep.equal([
                { id: 1, gender: { info: { deep: 'male' } },   name: { info: { deep: 'Brad' } } },
                { id: 2, gender: { info: { deep: 'male' } },   name: { info: { deep: 'George' } } },
                { id: 3, gender: { info: { deep: 'male' } },   name: { info: { deep: 'Matt' } } },
                { id: 4, gender: { info: { deep: 'male' } },   name: { info: { deep: 'Andy' } } },
                { id: 5, gender: { info: { deep: 'female' } }, name: { info: { deep: 'Julia' } } }
            ]);
        });
    });

    describe("fields()", function () {
        it("should return a new collection with only ids", function () {
            var _elements = _collection.fields([ 'id' ]);

            expect(_elements.all()).to.be.deep.equal([
                { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }
            ]);
        });
    });

    describe("clone()", function () {
        it("should return a new clone of the Collection", function () {
            var _collection1 = _collection;
            var _collection2 = _collection.clone();

            expect(_collection1).to.be.equal(_collection);
            expect(_collection2).to.be.not.equal(_collection);
        });
    });

    describe("remove()", function () {
        it("should remove 1 element with param { name: 'Brad' }", function () {
            var _elements = _collection.remove({ name: 'Brad' });
            expect(_elements.length).to.be.equal(4);

            var _empty = _elements.where([ { name: 'Brad' } ]);
            expect(_empty.length).to.be.equal(0);
        });

        it("should remove George with param 1", function () {
            var _elements = _collection.remove(1);
            expect(_elements.length).to.be.equal(4);

            var _empty = _elements.where({ name: 'George' });
            expect(_empty.length).to.be.equal(0);
        });

        it("should remove 2 elements with params [{ name: 'Matt' }, { name: 'Julia' }]", function () {
            var _elements = _collection.remove([
                { name: 'Brad' },
                { name: 'Julia' }
            ]);
            expect(_elements.length).to.be.equal(3);
        });
    });

    describe("on()", function () {
        describe("on('add')", function () {
            _collection = _(collection);

            var test = 0,
                names = [ 'Scott', 'Casey', 'Elliot', 'Bernie' ];

            _collection.on('add', function (elements) {
                it('should be ' + names[test], function () {
                    expect(elements[0].name).to.be.equal(names[test]);
                    test++;
                });
            })
            .prepend(   { name: names[0] })
            .append(    { name: names[1] })
            .before({}, { name: names[2] })
            .after( {}, { name: names[3] });

            it('should be called 4 times', function () {
                expect(test).to.be.equals(4);
            });
        });

        describe("on('remove')", function () {
            _collection = _(collection);

            var test = 0,
                names = [ 'Brad', 'George' ];

            _collection.on('remove', function (elements) {
                it('should be ' + names[0], function () {
                    expect(elements[0].name).to.be.equal(names[0]);
                });
                it('should be ' + names[1], function () {
                    expect(elements[1].name).to.be.equal(names[1]);
                });
                test++;
            })
            .remove([
                { name: names[0] },
                { name: names[1] },
            ])
            .remove({ // event shouldn't be trigger
                name: 'Bruce'
            });

            it('should be called 1 time', function () {
                expect(test).to.be.equals(1);
            });
        });

        describe("on('sort')", function () {
            _collection = _(collection);

            var test = 0,
                params = { name: -1 };

            _collection.on('sort', function (elements) {
                it('should be equal', function () {
                    expect(elements).to.be.equal(params);
                });
                test++;
            })
            .sort(params)
            .sort({ // event shouldn't be trigger
                nothing: 1
            });

            it('should be called 1 time', function () {
                expect(test).to.be.equals(1);
            });
        });

        describe("on('update')", function () {
            _collection = _(collection);

            var test = 0,
                params = [ { id: 1 }, { id: 3 } ];

            _collection.on('update', function (elements) {
                switch (test) {
                    case 0:
                        it('should be Bernie', function () {
                            expect(elements[0].name).to.be.equal('Bernie');
                        });
                        it('should be Bernie too', function () {
                            expect(elements[1].name).to.be.equal('Bernie');
                        });
                    break;
                    case 1:
                        it('should be Elliot', function () {
                            expect(elements[0].name).to.be.equal('Elliot');
                        });
                    break;
                    case 2:
                        it('should be Carl', function () {
                            expect(elements[0].name).to.be.equal('Carl');
                        });
                    break;
                }
                test++;
            })
            .update(params, { name: 'Bernie' })
            .update({ name: 'Bruce' }, { name: 'Bernie' }) // Should'nt be trigger
            .replace(params, { name: 'Elliot' })
            .set(1, { name: 'Carl' })
            .transfer({ name: 'firstname' })
            .fields([ 'id' ]);

            it('should be called 5 time', function () {
                expect(test).to.be.equals(5);
            });
        });

        describe("on('change')", function () {
            _collection = _(collection);

            var test = 0;

            _collection.on('change', function () {
                test++;
            })
            .update({ id: 1 }, {
                name: 'Bernie'
            })
            .remove({ id: 2 })
            .prepend({ id: 10, name: 'Bernie' })
            .sort({ id: 1 });

            it('should be called 4 time', function () {
                expect(test).to.be.equals(4);
            });
        });
    });

    describe("off()", function () {
        _collection = _(collection);

        var callback1 = function () { },
            callback2 = function () { },
            callback3 = function () { };

        var _elements = _collection
            .on('change', callback1)
            .on('change', callback2)
            .on('change', callback3)
            .on('add', callback1)
            .on('add', callback2)
            .on('add', callback3);

        _elements
            .off('change', callback1)
            .off('add', callback1)
            .off('add', callback2);

        it('should have 2 events on change', function () {
            expect(_elements.events.change.length).to.be.equals(2);
        });

        it('should have 1 events on add', function () {
            expect(_elements.events.add.length).to.be.equals(1);
        });
    });

    describe("index()", function () {
        it("index({ name: 'Julia' }) should return 4", function () {
            var index = _collection.index({ name: 'Julia' });
            expect(index).to.be.equal(4);
        });

        it("index({ name: 'Bruce' }) should return undefined", function () {
            var index = _collection.index({ name: 'Bruce' });
            expect(index).to.be.undefined;
        });
    });

    describe("indexOf()", function () {
        it("indexOf({ id: 5, name: 'Julia' }) should return 4", function () {
            var index = _collection.indexOf({ id: 5, name: 'Julia' });
            expect(index).to.be.equal(4);
        });

        it("indexOf({ id: 5, name: 'Julia' }, 6) should return -1", function () {
            var index = _collection.indexOf({ id: 5, name: 'Julia' }, 6);
            expect(index).to.be.equal(-1);
        });

        it("indexOf({ id: 5, name: 'Julia', nothing: true }) should return -1", function () {
            var index = _collection.indexOf({ id: 5, name: 'Julia', nothing: true });
            expect(index).to.be.equal(-1);
        });

        it("indexOf({ id: 2, name: 'Julia' }) should return -1", function () {
            var index = _collection.indexOf({ id: 2, name: 'Julia' });
            expect(index).to.be.equal(-1);
        });
    });

    describe("lastIndexOf()", function () {
        it("indexOf({ id: 5, name: 'Julia' }) should return 5", function () {
            var index = _collection
                .append({ id: 5, name: 'Julia' })
                .lastIndexOf({ id: 5, name: 'Julia' });
            expect(index).to.be.equal(5);
        });
    });

    describe("includes()", function () {
        it("indexOf({ id: 5, name: 'Julia' }) should return true", function () {
            var included = _collection.includes({ id: 5, name: 'Julia' });
            expect(included).to.be.true;
        });

        it("indexOf({ id: 5, name: 'Julia', nothing: false }) should return true", function () {
            var included = _collection.includes({ id: 5, name: 'Julia', nothing: false });
            expect(included).to.be.false;
        });
    });

    describe('join()', function () {
        it('should return a string with names joined by -', function () {
            var names = _collection.join('name', '-');

            expect(names).to.be.equal('Brad-George-Matt-Andy-Julia');
        });

        it('should return a string with names joined by -', function () {
            var names = _complexCollection.join('info.name', '-');
            expect(names).to.be.equal('Brad-George-Matt-Andy-Julia');
        });
    });

    describe("map()", function () {
        it("should return a collection with lowercase names", function () {
            var names = _collection.map(function (element) {
                element.name = element.name.toLowerCase();
                return element;
            }).pluck('name');
            expect(names).to.be.deep.equal([
                'brad', 'george', 'matt', 'andy', 'julia'
            ]);
        });
    });

    describe('forEach()', function () {
        it('should iterate 5 elements', function () {
            var test = '';
            var elements = _collection.forEach(function (element, i) {
                test += i + element.name;
            }).all();

            expect(test).to.be.equal('0Brad1George2Matt3Andy4Julia');
            expect(elements.length).to.be.equal(5);
        });
    });

    describe('filter()', function () {
        it('should return Brad and Julia', function () {
            var elements = _collection.filter(function (element) {
                return element.name[0] === 'B' || element.name[0] === 'J';
            }).all();

            expect(elements.length).to.be.equal(2);
            expect(elements[0].name).to.be.equal('Brad');
            expect(elements[1].name).to.be.equal('Julia');
        });
    });

    describe('some()', function () {
        it('should be true', function () {
            var hasSome = _collection.some(function (element) {
                return element.name === 'Brad';
            });
            expect(hasSome).to.be.true;
        });

        it('should be false', function () {
            var hasSome = _collection.some(function (element) {
                return element.name === 'Bruce';
            });
            expect(hasSome).to.be.false;
        });
    });

    describe('every()', function () {
        it('should be true', function () {
            var hasEvery = _collection.every(function (element) {
                return element.name === 'Brad';
            });
            expect(hasEvery).to.be.false;
        });

        it('should be false', function () {
            var hasEvery = _collection.every(function (element) {
                return element.id > 0 && element.id < 100;
            });
            expect(hasEvery).to.be.true;
        });
    });

    describe('concat()', function () {
        it('should be a concat array', function () {
            var _elements = _collection.concat([
                { id: 6, name: 'Scott' },
                { id: 7, name: 'Casey' }
            ], [
                { id: 8, name: 'Bernie' },
                { id: 9, name: 'Elliot' }
            ]).all();

            expect(_elements).to.be.deep.equal([
                { id: 1, name: 'Brad' },
                { id: 2, name: 'George' },
                { id: 3, name: 'Matt' },
                { id: 4, name: 'Andy' },
                { id: 5, name: 'Julia' },
                { id: 6, name: 'Scott' },
                { id: 7, name: 'Casey' },
                { id: 8, name: 'Bernie' },
                { id: 9, name: 'Elliot' }
            ]);
        });
    });

    describe("pop()", function () {
        it("should return Julia", function () {
            var element = _collection.pop();

            expect(element.name).to.be.equal('Julia');
        });

        it("should have remove Julia", function () {
            _collection.pop();
            var _elements = _collection.where({ name: 'Julia' });

            expect(_elements.length).to.be.equal(0);
        });
    });

    describe("shift()", function () {
        it("should return Brad", function () {
            var element = _collection.shift();

            expect(element.name).to.be.equal('Brad');
        });

        it("should have remove Brad", function () {
            _collection.shift();
            var _elements = _collection.where({ name: 'Brad' });

            expect(_elements.length).to.be.equal(0);
        });
    });

    describe("slice()", function () {
        it("should return 2 elements", function () {
            var _elements = _collection.slice(2, 4);

            expect(_elements.length).to.be.equal(2);
            expect(_elements.all()[0].name).to.be.equal('Matt');
            expect(_elements.all()[1].name).to.be.equal('Andy');
        });
    });

    describe("reduce()", function () {
        it("should return 2 elements", function () {
            var initials = _collection.reduce(function (initials, element) {
                return initials + element.name[0];
            }, '');

            expect(initials).to.be.equal('BGMAJ');
        });
    });

    describe("reverse()", function () {
        it("should reverse the collection", function () {
            var _elements = _collection.reverse();

            expect(_elements.all()).to.be.deep.equal([
                { id: 5, name: 'Julia' },
                { id: 4, name: 'Andy' },
                { id: 3, name: 'Matt' },
                { id: 2, name: 'George' },
                { id: 1, name: 'Brad' },
            ]);
        });
    });

    describe("chunk()", function () {
        it("should return a chunk array of 2", function () {
            var chunk = _collection.chunk(2);

            expect(chunk).to.be.deep.equal([
                [
                    { id: 1, name: 'Brad' },
                    { id: 2, name: 'George' }
                ], [
                    { id: 3, name: 'Matt' },
                    { id: 4, name: 'Andy' }
                ], [
                    { id: 5, name: 'Julia' }
                ]
            ]);
        });

        it("should return a chunk array of 3", function () {
            var chunk = _collection.chunk(3);

            expect(chunk).to.be.deep.equal([
                [
                    { id: 1, name: 'Brad' },
                    { id: 2, name: 'George' },
                    { id: 3, name: 'Matt' }
                ], [
                    { id: 4, name: 'Andy' },
                    { id: 5, name: 'Julia' }
                ]
            ]);
        });
    });
});

