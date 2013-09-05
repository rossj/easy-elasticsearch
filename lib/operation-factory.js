/*global require*/
var
// Node modules
	url = require('url'),
	http = require('http'),
	qs = require('querystring'),

// Npm modules
	_ = require('./mixins.js') && require('lodash');


var hasBody = function (endpoint) {
	return endpoint.method === 'put' || endpoint.method === 'post';
};

/**
 * Given an ES endpoint description, this function generates a checkArgs function that returns whether the passed
 * arguments are valid for the endpoint.
 * @param {Object} endpoint
 * @param {string} endpoint.method
 * @param {Array.<string>} endpoint.path
 * @param {Array.<string>} endpoint.options
 * @returns {function}
 */
var checkArgsFactory = function (endpoint) {
	//
	// Check the endpoint args
	//
	if ( !endpoint || !endpoint.method || !endpoint.path ) {
		throw new Error('Invalid endpoint description');
	}

	//
	// Get the string type variables that this endpoint requires
	//
	var args = ['base'].concat(_.whereStartsWithout(endpoint.path, '_'));

	//
	// Build the function to ensure these required args are given
	//
	var f = '';

	// Ensure all path variables are strings
	f += 'if ( ' + _.sandwich(args, 'typeof ', ' !== "string"').join(' || ') + ' ) return false;\n';

	// Ensure all path variables are not empty
	f += 'if ( ' + _.sandwich(args, '! ', '').join(' || ') + ' ) return false;\n';

	// Ensure the body param is given if required
	if ( hasBody(endpoint) ) {
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
	var args = ['base'].concat(_.whereStartsWithout(endpoint.path, '_'));

	// Ensure the body param is given if required
	if ( hasBody(endpoint) ) {
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

	f += 'var parts = this.url.parse(base);\n';
	f += 'var path = "/' + aPathParts.join('/') + '?" + this.qs.stringify(options);\n';
	f += 'var reqOpts = {hostname:parts.hostname, port:parts.port, method:"' + endpoint.method.toUpperCase() + '", path:path};\n';
	f += 'var req = this.http.request(reqOpts, function(res) {\n';
	f += '  res.setEncoding("utf8");\n';
	f += '  var data = "";\n';
	f += '  res.on("readable", function() { data += res.read(); });\n';
	f += '  res.on("end", function () {\n';
	f += '    var error = (res.statusCode < 200 || res.statusCode >= 300) ? new Error("Status code " + res.statusCode) : null;\n';
	f += '    cb(error, data && JSON.parse(data));\n';
	f += '  });\n';
	f += '});\n';

	f += 'req.on("error", cb);\n';

	if ( hasBody(endpoint) ) {
		f += 'req.write(JSON.stringify(body));\n';
	}

	f += 'req.end();\n';
	f += 'return true';

	return Function(args, f);
};

var context = {
	http : http,
	url : url,
	qs : qs
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

		return endpoint.execute.apply(context, arguments);
	};
};

module.exports = operationFactory;
module.exports._checkArgsFactory = checkArgsFactory;
module.exports._executeFactory = executeFactory;

