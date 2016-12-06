/*!-----------------------------------------------------------------------------
 * Collective JS — Manage Javascript Collections
 * v0.0.1-1 - built 2016-12-06
 * Licensed under the MIT License.
 * http://collective-js.jaysalvat.com/
 * ----------------------------------------------------------------------------
 * Copyright (C) 2016 Jay Salvat
 * http://jaysalvat.com/
 * --------------------------------------------------------------------------*/
/* global define */

(function (context, factory) {
    'use strict';
    // UMD
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        context.Collective = factory();
    }
})(this, function () {
    'use strict';

    /**
     * Collective Constructor
     * @constructor
     * @param {Mixed} collection [array, object, function, Collective instance ]
     */
    var Collective = function (input) {
        if (!(this instanceof Collective)) {
            return new Collective(input);
        }

        if (input instanceof Function) {
            input = input();
        }

        /**
         * Array of elements use by the collection
         * @type {Array}
         */
        this.collection = convert(input);
        this.length = this.collection.length;

        /**
         * Object of events and callbacks
         * @type {Object}
         */
        this.events = {};
    };

    /**
     * Get the value of a nested property by a dot.notation path
     * @param  {Object} object  Object to search in
     * @param  {String} path    Dot.notation string ex. key1.key2[0].key3
     * @return {Mixed}          Value
     */
    Collective.path = function (object, path) {
        path = (path || '').split('.');

        return path.reduce(function (value, key) {
            var index, matches = /(.*?)\[(.*?)\]$/g.exec(key);

            if (matches) {
                key = matches[1];
                index = matches[2];
            }

            try {
                return index !== undefined ? value[key][index] : value[key];
            } catch(e) {
                return;
            }
        }, object);
    };

    /**
     * Get an nested object build from a dot.notation path
     * @param  {String}  path      Dot.notation path
     * @param  {Mixed}   value     Value of the finale property
     * @param  {boolean} skipFirst Skip first level of object
     * @return {Object}
     */
    Collective.object = function (path, value, skipFirst) {
        var obj, buffer, key;

        path = (path || '').split('.');

        if (skipFirst) {
            path.shift();

            if (!path.length) {
                return value;
            }
        }

        while (path.length) {
            key = path.pop();
            obj = {};
            obj[key] = or(buffer, value);
            buffer = obj;
        }

        return obj;
    };

    /**
     * Convert an object to a dot.notation path
     * @param  {Object} obj     Object
     * @param  {String} [path]  Path to append
     * @return {String}
     */
    Collective.dot = function (obj, path) {
        path = path || [];

        Object.keys(obj).forEach(function (key) {
            path.push(key);

            if (typeof obj[key] === 'object') {
                return Collective.dot(obj[key], path);
            }
        });

        return path.join('.');
    };

    /**
     * Extend/Clone object
     * @param  {Object} target    Target Object
     * @param  {Object} ...source Source Objects
     * @return {Object}
     */
    Collective.extend = function (target) {
        var object = Object(target);

        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            if (source !== null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        object[key] = source[key];
                    }
                }
            }
        }

        return object;
    };

    /**
     * Prototype methods
     */
    Collective.prototype = {
        /**
         * Get the array of data
         * @return {Array}
         */
        all: function () {
            return this.collection;
        },

        /**
         * Set an element by its index
         * @param  {Number}         Index
         * @param  {Object}         Element
         * @return {Collecttive}    Collective collection
         */
        set: function (index, elmt) {
            var data = this.collection.slice();

            elmt = convert(elmt);

            data[index] = elmt;

            var clone = this.clone(data);

            this.trigger('update', [ elmt ], clone);

            return clone;
        },

        /**
         * Get an element by its index
         * Get an empty element if empty
         * @param  {Number}     Index
         * @return {Object}     Object of the collection
         */
        get: function (index) {
            return this.collection[index] || {};
        },

        /**
         * Get the first element of the collection
         * Get an empty object if empty
         * @return {Object}         Object of the collection
         */
        first: function () {
            return this.get(0);
        },

        /**
         * Get the last element of the collection
         * Get an empty element if empty
         * @return {Object}         Object of the collection
         */
        last: function () {
            return this.get(this.collection.length - 1);
        },

        /**
         * Get the value of a property from the 1st element of the collection
         * @param  {String} key     Key of a collection object property
         * @return {Mixed}          Value of the property
         */
        prop: function (key) {
            return this.get(0)[key];
        },

        /**
         * Get the first object of the collection matching search criteria
         * Get an empty object if empty
         * @param  {Mixed} queries  Object or array of objects of criteria
         * @return {Object}         Object of the collection
         */
        find: function (queries) {
            return this.where(queries).first();
        },

        /**
         * Get a collection of objects with some properties only
         * @param  {Array} fields   Array of property names
         * @return {Collective}     Collective collection
         */
        fields: function (keys) {
            var data = [];

            keys = forceArray(keys);

            this.collection.forEach(function (elmt) {
                var obj = {};

                keys.forEach(function (key) {
                    obj[key] = or(elmt[key], null);
                });

                data.push(obj);
            });

            var clone = this.clone(data);

            if (!compare(data, this.collection)) {
                this.trigger('update', data, clone);
            }

            return clone;
        },

        /**
         * Get an array or a key/value object of some object properties
         * @param  {Mixed}  keys1    Property or array of properties
         * @param  {Mixed}  keys2    Property or array of properties
         * @param  {String} format1  Format string to format response Ex. {0} [{1}]
         * @param  {String} format2  Format string to format response
         * @return {Mixed}           Array or Object
         */
        pluck: function (keys1, keys2, format1, format2) {
            var array = [], obj = {}, pairs = !!keys2;

            keys1 = forceArray(keys1);
            keys2 = forceArray(keys2);
            format1 = or(format1, '{0}');
            format2 = or(format2, '{0}');

            this.collection.forEach(function (elmt) {
                var formated1 = format1,
                    formated2 = format2;

                keys1.forEach(function (key, i) {
                    var value = Collective.path(elmt, key) || '';
                    formated1 = formated1.replace(new RegExp('\\{' + i + '\\}', 'g'), value);
                });

                keys2.forEach(function (key, i) {
                    var value = Collective.path(elmt, key) || '';
                    formated2 = formated2.replace(new RegExp('\\{' + i + '\\}', 'g'), value);
                });

                array.push(formated1);
                obj[formated1] = formated2;
            });

            return pairs ? obj : array;
        },

        /**
         * Sort the collection
         * @param  {Object} query   Object of properties to sort with 1: ASC, -1: DESC
         * @return {Collective}     Collective collection
         */
        sort: function (query) {
            var data = this.collection.slice();

            if (typeof query === 'function') {
                data = data.sort(query);
            } else {
                data = data.sort(function (elmt1, elmt2) {
                    var i, key, direction, value1, value2, keys = Object.keys(query);

                    for (i = 0; i < keys.length; i++) {
                        key = keys[i];
                        direction = query[key];
                        value1 = Collective.path(elmt1, key);
                        value2 = Collective.path(elmt2, key);

                        if (!direction) {
                            direction = -1;
                        }

                        if (value1 === undefined) {
                            return 0;
                        }
                        if (value1 < value2) {
                            return direction * -1;
                        }
                        if (value1 > value2) {
                            return direction;
                        }
                    }

                    return 0;
                });
            }

            var clone = this.clone(data);

            if (!compare(data, this.collection)) {
                this.trigger('sort', query, clone);
            }

            return clone;
        },

        /**
         * Get a collection with uniq elements only
         * @return {Collective}     Collective collection
         */
        uniq: function () {
            var self = this, data;

            data = this.collection.filter(function (elmt, index) {
                return self.index(elmt) === index;
            });

            return this.clone(data);
        },

        /**
         * Filter the collection matching search criteria
         * @param  {Mixed}  queries   Object or array of objects of criteria
         * @param  {Object} settings  Settings [ exclude, indexed ]
         * @return {Mixed}            Collective collection or array of indexes
         */
        where: function (queries, settings) {
            var indexes = [],
                data = this.collection.slice();

            settings = settings || {};

            queries = forceArray(queries);

            data = data.filter(function (elmt, index) {
                var q, found = settings.exclude;

                // Loop query elements
                for (q = 0; q < queries.length; q++) {
                    var i,
                        query = queries[q],
                        queryKeys = Object.keys(query),
                        keep = !settings.exclude;

                    // If index
                    if (Number.isInteger(query)) {
                         if (query !== index) {
                            keep = settings.exclude;
                            break;
                         }
                    // If object
                    } else {
                        // Loop object properties
                        for (i = 0; i < queryKeys.length; i++) {
                            var queryKey   = queryKeys[i],
                                queryValue = query[queryKey],
                                elmtValue  = Collective.path(elmt, queryKey);

                            // If function
                            if (typeof queryValue === 'function') {
                                if (!queryValue.call(this, elmtValue, queryKey)) {
                                    keep = settings.exclude;
                                }
                                break;
                            // If not function
                            } else if (queryValue === undefined || elmtValue !== queryValue) {
                                keep = settings.exclude;
                                break;
                            }
                        }
                    }

                    found = keep;

                    // Store indexes if not in `exclude mode`
                    if (keep !== settings.exclude) {
                        if (indexes.indexOf(index) < 0) {
                            indexes.push(index);
                        }
                        break;
                    }
                }

                return found;
            });

            // If indexes mode, we return an array of indexes
            if (settings.indexes) {
                return indexes;
            }

            return this.clone(data);
        },

        /**
         * Add elements to the collection
         * @param {String}  method   Name of JS method to use
         * @param {Mixed}   elmts    Element or array of elements to add
         * @param {Number}  [index]  Index for before/after method
         * @return {Collective}      Collective collection
         */
        add: function (method, elmts, index) {
            var data = this.collection.slice();

            elmts = convert(elmts, true);

            elmts.forEach(function (elmt) {
                if (method === 'splice') {
                    data.splice(index, 0, elmt);
                } else {
                    data[method](elmt);
                }
            });

            var clone = this.clone(data);

            this.trigger('add', elmts, clone);

            return clone;
        },

        /**
         * Add elements at the begginning of the collection
         * @param  {Mixed} elmts   Element or array of elements to add
         * @return {Collective}    Collective collection
         */
        append: function (elmts) {
            return this.add('push', elmts);
        },

        /**
         * Add elements at the end of the collection
         * @param  {Mixed} elmts   Element or array of elements to add
         * @return {Collective}    Collective collection
         */
        prepend: function (elmts) {
            return this.add('unshift', elmts);
        },

        /**
         * Add elements before an element of the collection matching search criteria
         * @param  {Object} query  Object of criteria
         * @param  {Mixed}  elmts  Element or array of elements to add
         * @return {Mixed}         Collective collection
         */
        before: function (query, elmts) {
            return this.add('splice', elmts, this.index(query));
        },

        /**
         * Add elements after an element of the collection matching search criteria
         * @param  {Object} query   Object of criteria
         * @param  {Mixed}  elmts   Element or array of elements to add
         * @return {Collective}     Collective collection
         */
        after: function (query, elmts) {
            return this.add('splice', elmts, this.index(query) + 1);
        },

        /**
         * Update the elements of the collection matching the search criteria
         * @param  {Mixed}   queries    Object or array of objects of criteria
         * @param  {Object}  newData    Object of data to update
         * @param  {boolean} [replace]  Replace/Merge mode
         * @return {Collective}         Collective collection
         */
        update: function (queries, newData, replace) {
            var self = this,
                data = this.collection.slice(),
                updated = [];

            //  If no query, update all the elements in the collection
            if (!newData || newData === true) {
                newData = queries;

                this.collection.forEach(function (elmt, index) {
                    self.update(index, newData, replace);
                });
            // Update the query selected elements
            } else {
                this.where(queries, { indexes: true }).forEach(function (index) {
                    if (replace) {
                        data[index] = newData;
                    } else {
                        Collective.extend(data[index], newData);
                    }

                    updated.push(data[index]);
                });
            }

            var clone = this.clone(data);

            if (updated.length) {
                this.trigger('update', updated, clone);
            }

            return clone;
        },

        /**
         * Replace the elements of the collection matching the search criteria
         * @param  {Mixed}   queries    Object or array of objects of criteria
         * @param  {Object}  newData    Object of data to update
         * @return {Collective}         Collective collection
         */
        replace: function (queries, newData) {
            return this.update(queries, newData, true);
        },

        /**
         * Get a collection without the elements matching the search criteria
         * @param  {Mixed}  queries   Object or array of objects of criteria
         * @return {Collective}       Collective collection
         */
        remove: function (queries) {
            var removed = this.where(queries).all(),
                clone   = this.where(queries, { exclude: true });

            if (removed.length) {
                this.trigger('remove', removed, clone);
            }

            return clone;
        },

        /**
         * Add an event callback when collection changes
         * @param  {String}   event     Name of the event [ change, add, remove, fields, update]
         * @param  {Function} callback  Function to call
         * @return {Collective}         Collective collection
         */
        on: function (event, callback) {
            this.events[event] = this.events[event] || [];
            this.events[event].push(callback);

            return this;
        },

        /**
         * Remove an event callback
         * @param  {String}   event     Name of the event [ change, add, remove, fields, update]
         * @param  {Function} callback  Function to remove
         * @return {Collective}         Collective collection
         */
        off: function (event, callback) {
            this.events[event] = (this.events[event] || []).filter(function (value) {
                return value !== callback;
            });

            return this;
        },

        /**
         * Trigger the event callbacks
         * @param  {String} event     Name of the event to trigger
         * @param  {Mixed}  data      Data to pass to the called function
         * @param  {Object} clone     Context for function call
         * @return {Collective}       Collective collection
         */
        trigger: function (event, data, context) {
            var callbacks1 = this.events.change || [], // Change event
                callbacks2 = this.events[event] || [], // X event
                callbacks  = callbacks1.concat(callbacks2);

            context = context || this;

            callbacks.forEach(function (callback) {
                callback.call(context, data, event);
            });

            return context;
        },

        /**
         * Clone a Collective collection
         * @param  {Array} data     Array of elements to copy in the new collection
         * @return {Collective}     Collective collection
         */
        clone: function (data) {
            var copy = Object.create(this);
            copy.collection = data ? data.slice() : this.collection.slice();
            copy.length = copy.collection.length;

            return copy;
        },

        /**
         * Transfer values to a new element structure
         * @param  {Object} mapping    Object of properties to transfer
         * @return {Collective}        Collective collection
         */
        transfer: function (mapping) {
            var data = [];

            function mapIt (mapping, elmt) {
                var buffer = {};

                Object.keys(mapping).forEach(function (key) {
                    var shortKey = key.split('.')[0],
                        value;

                    if (typeof mapping[key] === 'object') {
                        value = mapIt(mapping[key], elmt);
                    }
                    else if (typeof mapping[key] === 'string') {
                        value = Collective.path(elmt, mapping[key]);
                    }

                    buffer[shortKey] = Collective.object(key, value, true);
                });

                return buffer;
            }

            this.collection.forEach(function (elmt) {
                data.push(mapIt(mapping, elmt));
            });

            var clone = this.clone(data);

            if (!compare(data, this.collection)) {
                this.trigger('update', data, clone);
            }

            return clone;
        },

        /**
         * Split an array into chunks
         * @param  {Number} number  Number of elements per chunk
         * @return {Array}          Array of chunks
         */
        chunk: function (number) {
            var i, total, chunks = [];

            number = number || 5;
            total = Math.ceil(this.collection.length / number);

            for (i = 0; i < total; i++) {
                chunks.push(this.collection.slice(i * number, i * number + number));
            }

            return chunks;
        },


        /**
         * Get index of the first object of the collection matching search criteria
         * @param  {Mixed} queries  Object or array of objects of criteria
         * @return {Mixed}          Index of the object or false
         */
        index: function (queries) {
            return this.where(queries, { indexes: true })[0];
        },

        /**
         * Get index of the first found object in the collection similar to another object
         * @param  {Object}  obj1      Object to compare
         * @param  {Number}  [start]   Index to start with
         * @param  {boolean} [last]    last index
         * @return {Number}            Index found or -1
         */
        indexOf: function (elmt, start, last) {
            var i, index = -1, len = this.collection.length;

            start =  start || 0;

            for (i = start; i < len; i++) {
                var x, found = true,
                    j = last ? len - i + start - 1 : i,
                    elmt2     = this.collection[j],
                    elmtKeys  = Object.keys(elmt),
                    elmt2Keys = Object.keys(elmt2);

                for (x = 0; x < elmtKeys.length; x++) {
                    if (elmt[elmtKeys[x]] !== elmt2[elmtKeys[x]]) {
                        found = false;
                        break;
                    }
                }

                for (x = 0; x < elmt2Keys.length; x++) {
                    if (elmt[elmt2Keys[x]] !== elmt2[elmt2Keys[x]]) {
                        found = false;
                        break;
                    }
                }

                if (found) {
                    index = j;
                    break;
                }
            }

            return index;
        },

        /**
         * Get index of the last found object in the collection similar to another object
         * @param  {Object}  elmt      Element to compare
         * @param  {Number}  [start]   Index to start with
         * @return {Number}            Index found or -1
         */
        lastIndexOf: function (elmt, start) {
            return this.indexOf(elmt, start, true);
        },

        /**
         * Determine whether an array includes an element
         * @param  {Object}  elmt      Element to compare
         * @return {boolean}
         */
        includes: function (elmt) {
            return this.indexOf(elmt) > -1;
        },

        /**
         * Join an element property into a string.
         * @param  {String} key       Property key
         * @param  {String} separator Separator string
         * @return {String}           Elements joined in a string
         */
        join: function (key, separator) {
            return this.pluck(key).join(separator);
        }
    };

    /**
     * Proxy some native Array methods to modify the collection
     * @return {Collective}     Collective collection
     */
    [ 'forEach', 'filter', 'slice', 'concat', 'map', 'reverse' ].forEach(function (fn) {
        Collective.prototype[fn] = function () {
            var data = this.collection[fn].apply(this.collection, [].slice.call(arguments));

            return this.clone(data);
        };
    });

    /**
     * Proxy some native Array methods with native behaviors
     * @return {Mixed}
     */
    [ 'pop', 'shift', 'push', 'unshift', 'every', 'some', 'reduce', 'splice', 'fill' ].forEach(function (fn) {
        Collective.prototype[fn] = function () {
            var value = this.collection[fn].apply(this.collection, [].slice.call(arguments));

            this.length = this.collection.length;

            return value;
        };
    });

    /**
     * Some Helpers
     */

    /**
     * Return value2 if value1 is undefined
     * @param  {Mixed} value1  Value to check
     * @param  {Mixed} value2  Value to return
     * @return {Mixed}         Value1 or Value2
     */
    function or (value1, value2) {
        return value1 === undefined ? value2 : value1;
    }

    /**
     * Return an Array with the value if not already an Array
     * @param  {Mixed} elmts
     * @return {Array}
     */
    function forceArray (elmts) {
        return Array.isArray(elmts) ? elmts : [ elmts ];
    }

    /**
     * Flatten and compare 2 values, Array or Object to check if similare
     * @param  {Mixed} input1
     * @param  {Mixed} input2
     * @return {Boolean}
     */
    function compare (input1, input2) {
        return JSON.stringify(input1) === JSON.stringify(input2);
    }

    /**
     * Convert elements into a what Collective expects for its collection
     * Throw an Error if the collection is not valid (Array of Objects)
     * @param  {Mixed}   elmts       Array or OBject
     * @param  {Boolean} mustBeArray Force to be an Array
     * @return [Mixed]
     */
    function convert (elmts, mustBeArray) {
        elmts = JSON.parse(JSON.stringify(elmts));
        elmts = or(elmts.collection, elmts);
        elmts = mustBeArray ? forceArray(elmts) : elmts;
        isCollection(elmts, true);

        return elmts;
    }

    /**
     * Check if the collection is a valid Array of Objects
     * @param  {Array}    collection     Collection
     * @param  {Boolean}  throwError     Throw an error instead of returning false
     * @return [{Boolean}]
     */
    function isCollection (collection, throwError) {
        var isOk = forceArray(collection).every(function (element) {
            return {}.toString.call(element) === "[object Object]";
        });

        if (!isOk && throwError) {
            throw new Error('Collective only accepts Array/Objects.');
        }

        return isOk;
    }

    return Collective;
});

//# sourceMappingURL=maps/collective.js.map
