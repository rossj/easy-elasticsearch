var
// Node modules

// Npm modules
	_ = require('lodash'),

// Project modules
	operations = require('./operations.js');

var Client = function () {

};

Client.prototype.default = {
	base : '',
	protocol : 'http',
	host : 'localhost',
	port : 9200
};
Client.prototype.configure = function (options, index, type, id) {
	var o1 = this;
	_.defaults(options, o1.default);

	o1.index = index;
	o1.type = type;
	o1.id = id;

	var base = options.base || (options.protocol + '://' + options.hostname + ':' + options.port);
	var ops;
	if ( index && type && id ) {
		ops = operations.doc;
		_.each(ops, function (func, op) {
			o1[op] = _.partial(func, base, index, type, id);
		});
	} else if ( index && type ) {
		ops = operations.type;
		_.each(ops, function (func, op) {
			o1[op] = _.partial(func, base, index, type);
		});
	} else if ( index ) {
		ops = operations.index;
		_.each(ops, function (func, op) {
			o1[op] = _.partial(func, base, index);
		});
	} else {
		ops = operations.cluster;
		_.each(ops, function (func, op) {
			o1[op] = _.partial(func, base);
		});
	}

	console.log(_.keys(ops));
};

module.exports = new Client();
module.exports.Client = Client;

