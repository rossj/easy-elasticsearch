/*global require*/
var _ = require('lodash');
_.mixin({
	sandwich : function (array, before, after) {
		return _.map(array, function (item) {
			return before + item + after;
		});
	},
	whereStartsWithout : function (array, token) {
		return _.filter(array, function (item) {
			return item.indexOf(token) !== 0;
		});
	},

	//
	// Contains all mixins
	//
	containsAll : function(collection, targets) {
		return _.every(targets, function(target) {
			return _.contains(collection, target);
		});
	},
	wherePropContainsAll : function (collection, prop, targets) {
		return _.filter(collection, function (item) {
			return _.containsAll(item[prop], targets);
		});
	},

	//
	// Partial mixins
	//
	'_partialAllArray' : function (array) {
		if ( !_.isArray(array) ) throw new Error('Invalid arguments');

		var extraArgs = _.rest(arguments);
		return _.map(array, function (func) {
			var args = [func].concat(extraArgs);
			return _.partial.apply(null, args);
		});
	},
	'_partialAllObject' : function (object) {
		var keys = _.keys(object);
		var values = _.values(object);

		var args = [values].concat(_.rest(arguments));
		return _.object(keys, _._partialAllArray.apply(null, args));
	},
	'partialAll' : function (mixed) {
		var func = _.isArray(mixed) ? _._partialAllArray : _._partialAllObject;
		return func.apply(null, arguments);
	}
});

