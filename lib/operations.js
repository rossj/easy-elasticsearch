/*global require*/
var
// Node modules

// Npm modules
	_ = require('./mixins.js') && require('lodash'),

// Project modules
	api = require('./api.json'),
	operationFactory = require('./operation-factory');

// Let's flatten the api endpoint structure
var endpoints = _(api)
	.map(function (endpoints, operation) {
		// First, add the operation as a property of each endpoint
		return _.each(endpoints, function (endpoint) {
			endpoint.op = operation;
		});
	})
	.flatten()
	.value();

var endpointGroups = module.exports.endpointGroups =  {
	cluster : _(endpoints)
		.wherePropDoesNotContain('path', 'index')
		.groupBy('op')
		.value(),
	index : _(endpoints)
		.wherePropContainsAll('path', ['index'])
		.wherePropDoesNotContain('path', 'type')
		.groupBy('op')
		.value(),
	type : _(endpoints)
		.wherePropContainsAll('path', ['index', 'type'])
		.wherePropDoesNotContain('path', 'id')
		.groupBy('op')
		.value(),
	doc : _(endpoints)
		.wherePropContainsAll('path', ['index', 'type', 'id'])
		.groupBy('op')
		.value()
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
