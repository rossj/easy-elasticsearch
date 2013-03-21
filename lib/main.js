var
// Node modules

// Npm modules
	_ = require('lodash'),

// Project modules
	endpoints = require('./endpoints.js');

var Client = function () {

};

Client.prototype.configure = function (host, port, index, type, id) {
	var o1 = this;
	o1.host = host;
	o1.port = port;
	o1.index = index;
	o1.type = type;
	o1.id = id;

	var ops;
	if ( index && type && id ) {
		ops = endpoints.doc;
		_.each(ops, function (func, op) {
			o1[op] = _.partial(func, index, type, id);
		});
	} else if ( index && type ) {
		ops = endpoints.type;
		_.each(ops, function (func, op) {
			o1[op] = _.partial(func, index, type);
		});
	} else if ( index ) {
		ops = endpoints.index;
		_.each(ops, function (func, op) {
			o1[op] = _.partial(func, index);
		});
	} else {
		ops = endpoints.cluster;
		_.each(ops, function (func, op) {
			o1[op] = func;
		});
	}

	console.log(_.keys(ops));
};

module.exports = new Client();
module.exports.Client = Client;

