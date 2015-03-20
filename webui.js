var mineos = require('./mineos');
var server = require('./server');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userid = require('userid');
var whoami = require('whoami');
var bodyParser = require('body-parser')

var BASE_DIR = '/var/games/minecraft';
var response_options = {root: __dirname};

var OWNER_CREDS = {
  uid: userid.uid(whoami),
  gid: userid.gid(whoami)
}

var be = server.backend(BASE_DIR, io, OWNER_CREDS);

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.post('/create_server', function(req, res) {
	var server_name = req.body['server_name'];
	delete req.body['server_name'];

	be.webui_dispatcher({
		'command': 'create',
		'server_name': server_name,
		'properties': req.body
	});

    res.sendStatus(200); // equivalent to res.status(200).send('OK')
});

app.get('/', function(req, res){
  res.sendFile('index.html', response_options);
});

app.use('/angular', express.static(__dirname + '/node_modules/angular'));
app.use('/moment', express.static(__dirname + '/node_modules/moment'));
app.use('/angular-moment', express.static(__dirname + '/node_modules/angular-moment'));
app.use('/admin', express.static(__dirname + '/html'));

process.on('SIGINT', function() {
  console.log("Caught interrupt signal; closing webui....");
  process.exit();
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});