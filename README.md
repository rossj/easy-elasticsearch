# easy-elasticsearch
An elasticsearch HTTP client built to be flexible, intelligent, and informative. `easy-elasticsearch` has a built in query builder to ease the pain of generating the proper JSON.  
# Install
    $ npm install easy-elasticsearch
# Usage
`````javascript
var elastic = require('easy-elasticsearch');

// Initialize the client with options
elastic.configure({
	hostname : 'localhost',
	port : 9200
});

// A sample document to index
var doc = { field : 'data' };

elastic.index('myIndex', 'myType', 'docID', doc, function(err, data)  {
	// Check err...
});
`````
Additionally, we can bake the index, type, and even ID right into the configuration:  
`````javascript
// Initialize the client with options
elastic.configure({
	hostname : 'localhost',
	port : 9200,
	index : 'myIndex',
	type : 'myType',
	id : 'docID'
});

elastic.index(doc, function(err, data) {
	// Check err...
});
`````
Make as many `easy-elasticsearch` clients as needed:   
`````javascript
var Elastic = require('elasticsearch-client').Client;

// Initialize the client with options
var cluster = new Elastic().configure({
	hostname : 'localhost',
	port : 9200
});

var index = new Elastic().configure({
	hostname : 'otherhost',
	port : 9200,
	index : 'myIndex'
});
`````
# Methods
## index
index(index, type, id)  
index(index, type)  
## delete
delete(index, type, id)  
## get
get(index, type, id)  
get(index, id)  
## head
head(index, type, id)  
head(index, id)  
## multiGet
multiGet(index, type)  
multiGet(index)  
multiGet()  
## update
update(index, type, id)  
## search
search(index, type)  
search(index)  
search()  
## multiSearch
multiSearch(index, type)  
multiSearch(index)  
multiSearch()  
## percolator
percolator(index, name)  
## percolate
percolate(index, type)  
## bulk
bulk(index, type)  
bulk(index)  
bulk()  
## count
count(index, type)  
count(index)  
count()  
## deleteByQuery
deleteByQuery(index, type)  
deleteByQuery(index)  
## moreLikeThis
moreLikeThis(index, type, id)  
## validate
validate(index, type)  
validate(index)  
## explain
explain(index, type, id)  
## aliases
aliases()  
## analyze
analyze(index)  
analyze()  
## createIndex
createIndex(index)  
## deleteIndex
deleteIndex(index)  
