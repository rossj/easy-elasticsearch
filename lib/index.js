module.exports = Index;

var
// Node modules

// Npm modules
	_ = require('./mixins.js') && require('lodash'),

// Project modules
	operations = require('./operations.js'),
	Type = require('./type.js');

function Index(options) {
	var o1 = this;
	o1.options = _.defaults({}, options, o1._defaultOptions);
	o1.path = o1.options.protocol + '://' + o1.options.host + ':' + o1.options.port;
}

Index.prototype._defaultOptions = {
	base : '',
	protocol : 'http',
	host : 'localhost',
	port : 9200,
	index : 'dev'
};

// Add all cluster operations to the prototype
_.each(operations.index, function (fOp, sOp) {
	Index.prototype[sOp] = function () {
		var args = Array.prototype.slice.call(arguments);
		return fOp.apply(null, [this.path, this.options.index].concat(args));
	};
});

Index.prototype.useType = function (type) {
	var options = _.assign({}, this.options, { type : type });
	return new Type(options);
};

