/*global require, describe, it*/

/**
 * @fileOverview Tests the operationFactory module, which generates a JS function given an array of endpoint descritions
 * for an operation.
 * @name Record Keeper
 */

require('should');

var operationFactory = require('../lib/operation-factory.js');

describe('checkArgsFactory() resulting function', function () {
	describe('parameters', function () {
		/**
		 * Gets the parameter list for the provided function.
		 * @param {function} func
		 * @returns {Array.<string>}
		 */
		var getParamNames = function (func) {
			var funStr = func.toString();
			return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
		};

		it('should always generate a "path", "options", and "cb" parameter', function () {
			var endpoint = {
				"method" : "get",
				"path" : []
			};

			var testOp = operationFactory._checkArgsFactory(endpoint);
			getParamNames(testOp).should.eql(['base', 'options', 'cb']);
		});

		it('should generate a parameter for each path variable', function () {
			var endpoint = {
				"method" : "get",
				"path" : ["var1", "var2"]
			};

			var testOp = operationFactory._checkArgsFactory(endpoint);
			getParamNames(testOp).should.eql(['base', 'var1', 'var2', 'options', 'cb']);
		});

		it('should not generate a parameter for each path constant', function () {
			var endpoint = {
				"method" : "get",
				"path" : ["var1", "_constant1", "var2", "_constant2"]
			};

			var testOp = operationFactory._checkArgsFactory(endpoint);
			getParamNames(testOp).should.eql(['base', 'var1', 'var2', 'options', 'cb']);
		});

		it('should generate a body parameter for "put" requests', function () {
			var endpoint = {
				"method" : "put",
				"path" : ["var1", "_constant1", "var2", "_constant2"]
			};

			var testOp = operationFactory._checkArgsFactory(endpoint);
			getParamNames(testOp).should.eql(['base', 'var1', 'var2', 'body', 'options', 'cb']);
		});
	});

	describe('parameter checking', function () {
		/**
		 * The endpoint description for these tests. The following should produce a function that takes 1 base path arg,
		 * 2 string args, an optional options arg, and a cb arg.
		 */
		var endpoint = {
			"method" : "get",
			"path" : ["var1", "var2"]
		};
		var base = 'http://localhost:9200';

		// The function should require 2 valid string parameters
		var testOp = operationFactory._checkArgsFactory(endpoint);

		it('should return false with too few path parameters', function () {
			testOp(base).should.equal(false);
			testOp(base, "val1").should.equal(false);
		});

		it('should throw an error with too many path parameters', function () {
			testOp(base, "val1", "val2", "val3").should.equal(false);
		});

		it('should throw an error with non-string path parameters', function () {
			testOp(base, 1, 2).should.equal(false);
			testOp(base, "val1", null).should.equal(false);
		});

		it('should throw an error with empty-string path parameters', function () {
			testOp(base, "", "").should.equal(false);
		});

		it('should not throw an error with the proper path parameter count', function () {
			testOp(base, "val1", "val2").should.equal(true);
		});
	});
});

describe('operationFactory()', function () {
	it('should throw an error with invalid API description', function () {
		(function () {
			operationFactory();
		}).should.throw(/^Invalid API.*/);

		(function () {
			operationFactory({});
		}).should.throw(/^Invalid API.*/);

		(function () {
			operationFactory({
				"method" : "get",
				"path" : ["var1"]
			});
		}).should.throw(/^Invalid API.*/);

		(function () {
			operationFactory([]);
		}).should.not.throw();
	});
});
