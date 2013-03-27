/*global require*/

var
	_ = require('lodash'),
	api = require('./lib/api.json');

require('./lib/mixins.js');

var h1 = function(s) { console.log('# ' + s); };
var h2 = function(s) { console.log('## ' + s); };
var h3 = function(s) { console.log('### ' + s); };
var cmd = function(s) { console.log('    $ ' + s); };
var p = function(s) { console.log(s + '  '); };
var js = function(f) {
	console.log('`````javascript');
	var lines = f.toString().split('\n');
	for (var i = 1; i < lines.length-1; i++)
		console.log(lines[i].substr(1));
	console.log('`````');
};

h1('easy-elasticsearch');
p('An elasticsearch HTTP client built to be flexible, intelligent, and informative. `easy-elasticsearch` has a built in query builder to ease the pain of generating the proper JSON.');

h1('Install');

cmd('npm install easy-elasticsearch');

h1('Usage');

js(function() {
	var elastic = require('easy-elasticsearch');

	// Initialize the client with options
	elastic.configure({
		hostname : 'localhost',
		port : 9200
	});

	// A sample document to index
	var doc = { field : 'data' };

	elastic.index('myIndex', 'myType', 'docID', doc, function(err, data)  {
		// Check err...
	});
});

p('Additionally, we can bake the index, type, and even ID right into the configuration:');

js(function() {
	// Initialize the client with options
	elastic.configure({
		hostname : 'localhost',
		port : 9200,
		index : 'myIndex',
		type : 'myType',
		id : 'docID'
	});

	elastic.index(doc, function(err, data) {
		// Check err...
	});
});

p('Make as many `easy-elasticsearch` clients as needed: ');

js(function() {
	var Elastic = require('elasticsearch-client').Client;

	// Initialize the client with options
	var cluster = new Elastic().configure({
		hostname : 'localhost',
		port : 9200
	});

	var index = new Elastic().configure({
		hostname : 'otherhost',
		port : 9200,
		index : 'myIndex'
	});
});

h1('Methods');

_.each(api, function(endpoints, operation) {
	h2(operation);
	_.each(endpoints, function(endpoint) {
		var args = _.whereStartsWithout(endpoint.path, '_');
		p(operation + '(' + args.join(', ') + ')');
	});
});