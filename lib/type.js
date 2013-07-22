module.exports = Type;

var
// Node modules

// Npm modules
	_ = require('./mixins.js') && require('lodash'),

// Project modules
	operations = require('./operations.js');

function Type(options) {
	var o1 = this;
	o1.options = _.defaults({}, options, o1._defaultOptions);
	o1.path = o1.options.protocol + '://' + o1.options.host + ':' + o1.options.port;
}

Type.prototype._defaultOptions = {
	base : '',
	protocol : 'http',
	host : 'localhost',
	port : 9200,
	index : 'dev',
	type : 'file'
};

// Add all cluster operations to the prototype
_.each(operations.type, function (fOp, sOp) {
	Type.prototype[sOp] = function () {
		var args = Array.prototype.slice.call(arguments);
		return fOp.apply(null, [this.path, this.options.index, this.options.type].concat(args));
	};
});

