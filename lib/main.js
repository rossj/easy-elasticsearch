var
// Node modules

// Npm modules
	_ = require('lodash'),

// Project modules
	operations = require('./operations.js');

_.mixin({
	'partialAllArray' : function (array) {
		if ( !_.isArray(array) ) throw new Error('Invalid arguments');

		var extraArgs = _.rest(arguments);
		return _.map(array, function (func) {
			var args = [func].concat(extraArgs);
			return _.partial.apply(null, args);
		});
	},
	'partialAllObject' : function (object) {
		var keys = _.keys(object);
		var values = _.values(object);

		var args = [values].concat(_.rest(arguments));
		return _.object(keys, _.partialAllArray.apply(null, args));
	},
	'partialAll' : function (mixed) {
		var func = _.isArray(mixed) ? _.partialAllArray : _.partialAllObject;
		return func.apply(null, arguments);
	}
});

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

	console.log(_.keys(hOps));
};

module.exports = new Client();
module.exports.Client = Client;

