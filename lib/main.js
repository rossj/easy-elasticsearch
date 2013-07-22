module.exports = Factory;

var Cluster = Factory.Cluster = require('./cluster.js');

function Factory(options) {
	return new Cluster(options);
}
