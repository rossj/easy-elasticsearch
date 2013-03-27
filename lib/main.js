/*global require*/

var
// Node modules

// Npm modules
	_ = require('./mixins.js') && require('lodash'),

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

	o1.index = index || options.index;
	o1.type = type || options.type;
	o1.id = id || options.id;

	var base = options.base || (options.protocol + '://' + options.hostname + ':' + options.port);
	var hOps;
	if ( index && type && id ) {
		hOps = _.partialAll(operations.doc, base, index, type, id);
	} else if ( index && type ) {
		hOps = _.partialAll(operations.type, base, index, type);
	} else if ( index ) {
		hOps = _.partialAll(operations.index, base, index);
	} else {
		hOps = _.partialAll(operations.cluster, base);
	}

	// Assign the operation functions to this object
	_.assign(o1, hOps);

	o1._operations = _.keys(hOps);
};

module.exports = new Client();
module.exports.Client = Client;

