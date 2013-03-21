var
// Node modules

// Npm modules
	_ = require('lodash'),

// Project modules
	elastic = require('./../lib/main.js');

elastic.configure({
	localhost : 'localhost',
	port : 9200
}, 'testIndex', 'testType', 'testID');

var doc = {
	blahDoc : 'doc'
};

elastic.index(doc, function(err) {
	console.log('Done!');
	console.log(err);
});

elastic.index('aaa', doc, function(err) {
	console.log('Done!');
	console.log(err);
});

var elastic2 = new elastic.Client('localhost', 9200, 'test', 'type');
