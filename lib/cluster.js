module.exports = Cluster;

var
// Node modules

// Npm modules
	_ = require('./mixins.js') && require('lodash'),

// Project modules
	operations = require('./operations.js'),
	Index = require('./index.js');

function Cluster(options) {
	var o1 = this;
	o1.options = _.defaults({}, options, o1._defaultOptions);
	o1.path = o1.options.protocol + '://' + o1.options.host + ':' + o1.options.port;
}

Cluster.prototype._defaultOptions = {
	base : '',
	protocol : 'http',
	host : 'localhost',
	port : 9200
};

// Add all cluster operations to the prototype
_.each(operations.cluster, function (fOp, sOp) {
	Cluster.prototype[sOp] = function () {
		var args = Array.prototype.slice.call(arguments);
		return fOp.apply(null, [this.path].concat(args));
	};
});

Cluster.prototype.useIndex = function (index) {
	var options = _.assign({}, this.options, { index : index });
	return new Index(options);
};

