/*global require, describe, it*/

/**
 * @fileOverview Tests the operationFactory module, which generates a JS function given an array of endpoint descritions
 * for an operation.
 * @name Record Keeper
 */


var
	nock = require('nock'),
	should = require('should'),
	operationFactory = require('../lib/operation-factory.js');

/**
 * A simple helper object for generating sequences of mock Rackspace responses
 * @type {Object}
 */
var superNock = {
	scopes : [],
	allDone : function () {
		// Assert that all the scopes are done
		for ( var i = 0; i < this.scopes.length; i++ ) {
			this.scopes[i].done();
		}
		// Clear all scopes
		this.scopes = [];
	},
	get : function (path, data) {
		// Setup nock to respond to a good auth request, twice
		var scope = nock('http://localhost:9200')
			.get(path)
			.reply(200, data);

		this.scopes.push(scope);
		return this;
	}
};

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

describe('operationFactory() resulting function', function () {
	var api = [{
		"method" : "get",
		"path" : ["var1", "var2"]
	}, {
		"method" : "get",
		"path" : ["var1"]
	}];
	var base = 'http://localhost:9200';
	var op = operationFactory(api);

	it('should work with multiple endpoints', function() {
		(function() {
			op(base, "val1", "val2", "val3");
		}).should.throw(/^No valid endpoint.*/);

		(function() {
			op(base, "val1", "val2");
		}).should.not.throw();

		(function() {
			op(base, "val1");
		}).should.not.throw();

		(function() {
			op(base);
		}).should.throw(/^No valid endpoint.*/);
	});

	it('should make the proper http request', function() {
		// Set up nock to respond to the request
		var testData = {
			prop1 : 'data1',
			prop2 : 'data2'
		};
		superNock.get('/val1/val2', testData);

		// Hope the request fires
		(function() {
			op(base, "val1", "val2", function(err, data) {
				should.not.exist(err);
				should.exist(data);
				testData.should.eql(data);
			});
		}).should.not.throw();

		superNock.allDone();
	});
});
