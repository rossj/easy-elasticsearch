/*global require*/
var
// Node modules

// Npm modules
	_ = require('lodash'),

// Project modules
	api = require('./api.json'),
	operationFactory = require('./operation-factory');

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
