/*global require*/
var
// Node modules

// Npm modules
	_ = require('lodash'),

// Project modules
	api = require('./api.json');

_.mixin({
	'sandwich' : function (array, before, after) {
		return _.map(array, function (item) {
			return before + item + after;
		});
	},
	'doesntStartWith' : function (array, token) {
		return _.filter(array, function (item) {
			return item.indexOf(token) !== 0;
		});
	},
	'propContains' : function (array, prop, token) {
		return _.filter(array, function (item) {
			return _.contains(item[prop], token);
		});
	}
});

/**
 * Given an ES endpoint description, this function generates a checkArgs function that returns whether the passed
 * arguments are valid for the endpoint.
 * @param {Object} endpoint
 * @param {string} endpoint.method
 * @param {Array.<string>} endpoint.path
 * @param {Array.<string>} endpoint.options
 * @returns {function}
 */
checkArgsFactory = function (endpoint) {
	//
	// Get the string type variables that this endpoint requires
	//
	var args = _.doesntStartWith(endpoint.path, '_');

	//
	// Build the function to ensure these required args are given
	//
	var f = '';

	// Ensure all path variables are given
	if ( args.length )
		f += 'if ( ' + _.sandwich(args, 'typeof ', ' !== "string"').join(' || ') + ' ) return false;\n';

	// Build the request path
	f += 'return true';

	return Function(args, f);
};

/**
 * Given an ES endpoint description, this function generates a method to perform a request.
 * @param {Object} endpoint
 * @param {string} endpoint.method
 * @param {Array.<string>} endpoint.path
 * @param {Array.<string>} endpoint.options
 * @returns {function}
 */
var executeFactory = function (endpoint) {
	//
	// Build the parameter list
	//
	var args = _.doesntStartWith(endpoint.path, '_');

	// Ensure the body param is given if required
	if ( endpoint.method === 'get' || endpoint.method === 'post' || endpoint.method === 'get body' ) {
		args.push('body');
	}

	// Push the final args for all methods
	args.push('options');
	args.push('cb');

	//
	// Build the function to execute the request
	//
	var f = '';

	// Normalize the cb parameter
	f += 'cb = cb || (typeof options === "function" ? options : function() {});\n';

	// Normalize the options parameter
	f += 'options = typeof options !== "function" ? options : {};\n';

	// Build the request path
	var aPathParts = _.map(endpoint.path, function(part) {
		// If the path part starts with an underscore, it is an actual keyword in the path and can be left as-is
		if (part.indexOf('_') === 0)
			return part;

		return '"+' + part + '+"';
	});

	f += 'var path = "/' + aPathParts.join('/') + '";\n';
	f += 'console.log(path);\n';
	f += 'return true';

	console.log(f);
	return Function(args, f);
};

/**
 * Given an ES operation and set of endpoints, this returns a function that will process the operation, and
 * execute against the appropriate endpoint.
 * @param {Array.<{method:string, path:Array, options:Array}>} endpoints
 */
var operationFactory = function (endpoints) {
	// Generate and assign the checkArgs and execute methods for each endpoint
	_.each(endpoints, function (endpoint) {
		_.assign(endpoint, {
			checkArgs : checkArgsFactory(endpoint),
			execute : executeFactory(endpoint)
		});
	});

	return function () {
		var endpoint, i;

		// Find the first endpoint that matches the arguments
		for ( i = 0; i < endpoints.length; i++ ) {
			if ( endpoints[i].checkArgs.apply(null, arguments) ) {
				endpoint = endpoints[i];
				break;
			}
		}

		if ( !endpoint ) {
			return console.log('Error! No valid endpoint found');
		}

		return endpoint.execute.apply(_, arguments);
	};
};

// Let's flatten the api endpoint structure
var endpoints = _(api)
	.map(function (endpoints, operation) {
		// First, add the operation as a property of each endpoint
		_.each(endpoints, function (endpoint) {
			endpoint.op = operation;
		});

		return endpoints;
	})
	.flatten(true)
	.value();

var endpointGroups = {
	cluster : _.groupBy(endpoints, 'op'),
	index : _(endpoints).propContains('path', 'index').groupBy('op').value(),
	type : _(endpoints).propContains('path', 'type').groupBy('op').value(),
	doc : _(endpoints).propContains('path', 'id').groupBy('op').value()
};

/*
 console.log(_(clusterEndpoints).pluck('op').unique().value());
 console.log(_(indexEndpoints).pluck('op').unique().value());
 console.log(_(typeEndpoints).pluck('op').unique().value());
 console.log(_(docEndpoints).pluck('op').unique().value());
 */

_.each(endpointGroups, function (endpointGroup, key) {
	var endpointFuncs = _.map(endpointGroup, operationFactory);
	module.exports[key] = _.object(_.keys(endpointGroup), endpointFuncs);
});
