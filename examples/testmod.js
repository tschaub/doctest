/**
 *  Adds two values.
 * 
 *  js> var c = add(1, 2);
 *  js> c
 *  3
 *
 *  This is not included.
 */
exports.add = function(a, b) {
    return a + b;
}

/**
 *  Subtracts two values.
 * 
 *  js> var c = subtract(1, 2);
 *  js> c
 *  -1
 *
 *  This is not included.
 */
exports.subtract = function(a, b) {
    return a - b;
}

if (module.id === require.main) {
    var doctest = require('doctest');
    doctest.testmod({verbose: true});
}

