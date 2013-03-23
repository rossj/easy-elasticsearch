/*global require*/
var
// Node modules

// Npm modules
	_ = require('lodash');

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
	// Check the endpoint args
	//
	if (!endpoint || !endpoint.method || !endpoint.path) {
		throw new Error('Invalid endpoint description');
	}

	//
	// Get the string type variables that this endpoint requires
	//
	var args = ['base'].concat(_.doesntStartWith(endpoint.path, '_'));

	//
	// Build the function to ensure these required args are given
	//
	var f = '';

	// Ensure all path variables are strings
	f += 'if ( ' + _.sandwich(args, 'typeof ', ' !== "string"').join(' || ') + ' ) return false;\n';

	// Ensure all path variables are not empty
	f += 'if ( ' + _.sandwich(args, '! ', '').join(' || ') + ' ) return false;\n';

	// Ensure the body param is given if required
	if ( endpoint.method === 'put' || endpoint.method === 'post' || endpoint.method === 'get body' ) {
		args.push('body');
		f += 'if (typeof body !== "object") return false;\n';
	}

	// Ensure the options parameter is undefined, an object, or a function
	args.push('options');
	f += 'if (typeof options !== "undefined" && typeof options !== "object" && typeof options !== "function") return false;\n';

	// Ensure the callback is either undefined or a function
	args.push('cb');
	f += 'if (typeof cb !== "undefined" && typeof cb !== "function") return false;\n';

	// Build the request path
	f += 'return true';

	return Function(args, f);
};

/**
 * Given an ES endpoint description, this function generates a method to perform a request.
 * @param {Object} endpoint
 * @param {string} endpoint.method
 * @param {Array.<string>} endpoint.path
 * @param {?Array.<string>} endpoint.options
 * @returns {function}
 */
var executeFactory = function (endpoint) {
	//
	// Build the parameter list
	//
	var args = ['base'].concat(_.doesntStartWith(endpoint.path, '_'));

	// Ensure the body param is given if required
	if ( endpoint.method === 'put' || endpoint.method === 'post' || endpoint.method === 'get body' ) {
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
	var aPathParts = _.map(endpoint.path, function (part) {
		// If the path part starts with an underscore, it is an actual keyword in the path and can be left as-is
		if ( part.indexOf('_') === 0 )
			return part;

		return '"+' + part + '+"';
	});

	f += 'var path = "/' + aPathParts.join('/') + '";\n';
	f += 'return true';

	return Function(args, f);
};

/**
 * Given an ES operation and set of endpoints, this returns a function that will process the operation, and
 * execute against the appropriate endpoint.
 * @param {Array.<{method:string, path:Array, options:Array}>} endpoints
 */
var operationFactory = function (endpoints) {
	if ( !_.isArray(endpoints) ) {
		throw new Error('Invalid API endpoint description');
	}

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
			throw new Error('No valid endpoint found for given parameters');
		}

		return endpoint.execute.apply(_, arguments);
	};
};

module.exports = operationFactory;
module.exports._checkArgsFactory = checkArgsFactory;
module.exports._executeFactory = executeFactory;

