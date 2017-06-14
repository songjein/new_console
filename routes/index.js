var express = require('express');
var router = express.Router();

var request = require('request');

/**
* root address => serving index.html file
*/
router.get('/', function(req, res, next) {
	res.sendFile('index.html');
});

/** 
* query proxy
* for the CROS problem at javascript
*/

var headers = {
	'User-Agent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
	'Content-Type':     'application/json'
}

//router.post('/query-service', (req, res, next) => {	
router.post('/query/service', (req, res, next) => {	
	var host = 'http://localhost:19002';
	var path = '/query/service';
	var statement = req.body.statement

	var options = {
		url: host + path,	
		method: 'POST',
		headers: headers,
		form: {"statement": statement}
	};

	request(options, function(error, response, body){
		console.log("reuslt", response);
		res.json(body);			
	});
});

router.get('/query-aql', (req, res, next) => {	
	var host = 'http://localhost:19002';
	var path = '/query?query=';
	var query = req.query.query

	request({
		url: host + path + query
	}, function(error, response, body){
		res.json(body);			
	});
});

router.get('/ddl-aql', (req, res, next) => {	
	var host = 'http://localhost:19002';
	var path = '/ddl?ddl=';
	var query = req.query.ddl

	request({
		url: host + path + query,	
	}, function(error, response, body){
		res.send(body);			
	});
});

module.exports = router;
